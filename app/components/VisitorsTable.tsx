import { useState, useMemo } from 'react';
import { VisitorInfo } from '../types/dashboard';

interface VisitorsTableProps {
    visitors: VisitorInfo[];
}

type SortField = keyof VisitorInfo;
type SortDirection = 'asc' | 'desc';

export default function VisitorsTable({ visitors }: VisitorsTableProps) {
    const [sortField, setSortField] = useState<SortField>('client_timestamp');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterVPN, setFilterVPN] = useState<'all' | 'vpn' | 'direct'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Filter and sort visitors
    const filteredAndSortedVisitors = useMemo(() => {
        const filtered = visitors.filter(visitor => {
            const matchesSearch = searchTerm === '' ||
                visitor.ip.toLowerCase().includes(searchTerm.toLowerCase()) ||
                visitor.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
                visitor.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                visitor.browser.toLowerCase().includes(searchTerm.toLowerCase()) ||
                visitor.os.toLowerCase().includes(searchTerm.toLowerCase()) ||
                visitor.device.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesVPN = filterVPN === 'all' ||
                (filterVPN === 'vpn' && visitor.isVPN) ||
                (filterVPN === 'direct' && !visitor.isVPN);

            return matchesSearch && matchesVPN;
        });

        // Sort visitors
        filtered.sort((a, b) => {
            let aValue = a[sortField];
            let bValue = b[sortField];

            // Handle special cases
            if (sortField === 'client_timestamp') {
                aValue = new Date(aValue as string).getTime();
                bValue = new Date(bValue as string).getTime();
            } else if (typeof aValue === 'string' && typeof bValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        return filtered;
    }, [visitors, sortField, sortDirection, searchTerm, filterVPN]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredAndSortedVisitors.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentVisitors = filteredAndSortedVisitors.slice(startIndex, endIndex);

    // Reset to first page when filters change
    const handleFilterChange = (newSearchTerm: string, newFilterVPN: 'all' | 'vpn' | 'direct') => {
        setSearchTerm(newSearchTerm);
        setFilterVPN(newFilterVPN);
        setCurrentPage(1);
    };

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const getSortIcon = (field: SortField) => {
        if (sortField !== field) return null;
        return sortDirection === 'asc' ? '↑' : '↓';
    };

    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    const goToPreviousPage = () => {
        goToPage(currentPage - 1);
    };

    const goToNextPage = () => {
        goToPage(currentPage + 1);
    };

    // Generate page numbers for pagination
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;
        
        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            }
        }
        
        return pages;
    };

    if (visitors.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Recent Visitors</h3>
                </div>
                <div className="text-center py-8">
                    <p className="text-gray-500">No data available for the selected filters</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Recent Visitors</h3>

                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Search */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search visitors..."
                                value={searchTerm}
                                onChange={(e) => handleFilterChange(e.target.value, filterVPN)}
                                className="pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <svg className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        {/* VPN Filter */}
                        <select
                            value={filterVPN}
                            onChange={(e) => handleFilterChange(searchTerm, e.target.value as 'all' | 'vpn' | 'direct')}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">All Connections</option>
                            <option value="vpn">VPN Only</option>
                            <option value="direct">Direct Only</option>
                        </select>

                        {/* Items per page */}
                        <select
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value={5}>5 per page</option>
                            <option value={10}>10 per page</option>
                            <option value={25}>25 per page</option>
                            <option value={50}>50 per page</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th
                                className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('id')}
                            >
                                ID {getSortIcon('id')}
                            </th>
                            <th
                                className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('ip')}
                            >
                                IP {getSortIcon('ip')}
                            </th>
                            <th
                                className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('country')}
                            >
                                Country {getSortIcon('country')}
                            </th>
                            <th
                                className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('state')}
                            >
                                State {getSortIcon('state')}
                            </th>
                            <th
                                className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('city')}
                            >
                                City {getSortIcon('city')}
                            </th>
                            <th
                                className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('platform')}
                            >
                                Platform {getSortIcon('platform')}
                            </th>
                            <th
                                className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('browser')}
                            >
                                Browser {getSortIcon('browser')}
                            </th>
                            <th
                                className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('version')}
                            >
                                Version {getSortIcon('version')}
                            </th>
                            <th
                                className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('os')}
                            >
                                OS {getSortIcon('os')}
                            </th>
                            <th
                                className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('device')}
                            >
                                Device {getSortIcon('device')}
                            </th>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">VPN</th>
                            <th
                                className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('language')}
                            >
                                Language {getSortIcon('language')}
                            </th>
                            <th
                                className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('client_timestamp')}
                            >
                                Time {getSortIcon('client_timestamp')}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {currentVisitors.map((visitor) => (
                            <tr key={visitor.id} className="hover:bg-gray-50">
                                <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">{visitor.id}</td>
                                <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 font-mono">{visitor.ip}</td>
                                <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden sm:table-cell">{visitor.country}</td>
                                <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden lg:table-cell">{visitor.state}</td>
                                <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden lg:table-cell">{visitor.city}</td>
                                <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden md:table-cell">{visitor.platform}</td>
                                <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">{visitor.browser}</td>
                                <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden xl:table-cell">{visitor.version}</td>
                                <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden md:table-cell">{visitor.os}</td>
                                <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden xl:table-cell">{visitor.device}</td>
                                <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                                    {visitor.isVPN ? (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                            VPN
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Direct
                                        </span>
                                    )}
                                </td>
                                <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden lg:table-cell">{visitor.language}</td>
                                <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden sm:table-cell">
                                    {new Date(visitor.client_timestamp).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination controls */}
            <div className="px-4 sm:px-6 py-3 border-t border-gray-200 bg-gray-50">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-gray-600">
                        Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedVisitors.length)} of {filteredAndSortedVisitors.length} visitors
                        {searchTerm && ` matching "${searchTerm}"`}
                        {filterVPN !== 'all' && ` (${filterVPN} connections only)`}
                    </div>
                    
                    {totalPages > 1 && (
                        <div className="flex items-center space-x-1">
                            <button
                                onClick={goToPreviousPage}
                                disabled={currentPage === 1}
                                className="px-3 py-2 border border-gray-300 rounded-l-md text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                Previous
                            </button>
                            
                            {getPageNumbers().map((page, index) => (
                                <button
                                    key={index}
                                    onClick={() => typeof page === 'number' ? goToPage(page) : null}
                                    disabled={page === '...'}
                                    className={`px-3 py-2 border border-gray-300 text-sm font-medium ${
                                        page === '...' 
                                            ? 'text-gray-400 cursor-default' 
                                            : currentPage === page 
                                                ? 'bg-blue-500 text-white border-blue-500' 
                                                : 'text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                            
                            <button
                                onClick={goToNextPage}
                                disabled={currentPage === totalPages}
                                className="px-3 py-2 border border-gray-300 rounded-r-md text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 