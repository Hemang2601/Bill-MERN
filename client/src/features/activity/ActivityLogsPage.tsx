import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, Search, ShieldCheck, User, RefreshCw, Clock } from 'lucide-react';
import { auditApi } from '../../services/api';
import { formatDate } from '../../lib/utils';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const ActivityLogsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [managerFilter, setManagerFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['auditLogs', { page, manager: managerFilter, action: actionFilter }],
    queryFn: () => auditApi.getLogs({ page, limit: 30, manager: managerFilter, action: actionFilter }),
  });

  const logs = data?.data || [];
  const pagination = data?.pagination;

  const getActionBadgeClass = (action: string) => {
    if (action.includes('CREATE') || action.includes('LOGIN'))
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (action.includes('UPDATE') || action.includes('PASSWORD'))
      return 'bg-blue-50 text-blue-700 border-blue-200';
    if (action.includes('ARCHIVE') || action.includes('DEACTIVATE') || action.includes('LOGOUT'))
      return 'bg-rose-50 text-rose-700 border-rose-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#111827] tracking-tight">
            Security & Activity Audit Logs
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Immutable tracking of managerial actions, logins, invoice generations, and financial changes
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          onClick={() => refetch()}
        >
          Refresh Logs
        </Button>
      </div>

      {/* Filter Bar */}
      <Card className="p-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <select
              value={managerFilter}
              onChange={(e) => {
                setManagerFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-white border border-[#E8ECF3] rounded-lg text-[#111827] focus:outline-none focus:border-[#2563EB]"
            >
              <option value="">All Managers</option>
              <option value="hiren">Hiren</option>
              <option value="suresh">Suresh</option>
            </select>
          </div>

          <div>
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-white border border-[#E8ECF3] rounded-lg text-[#111827] focus:outline-none focus:border-[#2563EB]"
            >
              <option value="">All Actions</option>
              <option value="LOGIN">LOGIN</option>
              <option value="LOGOUT">LOGOUT</option>
              <option value="CREATE_INVOICE">CREATE_INVOICE</option>
              <option value="UPDATE_INVOICE">UPDATE_INVOICE</option>
              <option value="ARCHIVE_INVOICE">ARCHIVE_INVOICE</option>
              <option value="RECORD_PAYMENT">RECORD_PAYMENT</option>
              <option value="CREATE_CUSTOMER">CREATE_CUSTOMER</option>
              <option value="UPDATE_SETTINGS">UPDATE_SETTINGS</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Logs Table */}
      <Card className="overflow-hidden p-0 border border-[#E8ECF3]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#E8ECF3] text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Manager</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity Type</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8ECF3]">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-[#111827]">{log.managerDisplayName}</span>
                    <span className="text-slate-400 text-[10px] block font-mono">@{log.managerUsername}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getActionBadgeClass(
                        log.action
                      )}`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-700">
                    {log.entityType}
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs font-mono text-[11px]">
                    {JSON.stringify(log.details)}
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-mono text-[10px]">
                    {log.ipAddress || '127.0.0.1'}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-semibold text-slate-600">No activity logs recorded yet</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between p-3 border-t border-[#E8ECF3] bg-[#F8FAFC] text-xs">
            <span className="text-slate-500">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} entries)
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
