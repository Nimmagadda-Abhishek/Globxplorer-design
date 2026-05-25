import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import {
  Search,
  RefreshCcw,
  AlertCircle,
  CheckCircle2,
  Clock,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { notificationApi } from "../../../lib/api";
import { format } from "date-fns";

export function WhatsAppLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response: any = await notificationApi.getWhatsAppLogs({ page, limit: 20 });
      if (response.status === "success") {
        setLogs(response.data.logs);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" /> Sent</Badge>;
      case "delivered":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200"><CheckCircle2 className="w-3 h-3 mr-1" /> Delivered</Badge>;
      case "read":
        return <Badge className="bg-green-600 text-white"><CheckCircle2 className="w-3 h-3 mr-1" /> Read</Badge>;
      case "failed":
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" /> Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredLogs = logs.filter(log =>
    log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.userId?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.userId?.phone || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">WhatsApp Logs</h1>
          <p className="text-muted-foreground">
            Monitor outgoing WhatsApp notifications and delivery statuses.
          </p>
        </div>
        <Button onClick={fetchLogs} variant="outline" size="sm" disabled={loading}>
          <RefreshCcw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium">Message History</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Loading logs...
                    </TableCell>
                  </TableRow>
                ) : filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No logs found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log._id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{log.userId?.name || "Unknown User"}</span>
                          <span className="text-xs text-muted-foreground">{log.userId?.phone || "N/A"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="w-4 h-4 mt-1 text-muted-foreground shrink-0" />
                          <span className="text-sm line-clamp-2" title={log.message}>
                            {log.message}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(log.status)}
                        {log.status === 'failed' && log.metadata?.whatsappError && (
                          <p className="text-[10px] text-red-500 mt-1 max-w-[150px] truncate" title={log.metadata.whatsappError.message}>
                            {log.metadata.whatsappError.message}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-xs">
                        {log.sentAt ? format(new Date(log.sentAt), "MMM d, HH:mm") : "N/A"}
                      </TableCell>

                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || loading}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
