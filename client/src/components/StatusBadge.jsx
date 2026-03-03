const STATUS_CONFIG = {
  // Visit statuses
  requested: { label: 'Requested', color: 'bg-yellow-100 text-yellow-800' },
  scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-800' },
  visited: { label: 'Visited', color: 'bg-green-100 text-green-800' },
  decision_pending: { label: 'Decision Pending', color: 'bg-purple-100 text-purple-800' },
  // Listing statuses
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800' },
  review: { label: 'Under Review', color: 'bg-orange-100 text-orange-800' },
  published: { label: 'Published', color: 'bg-green-100 text-green-800' },
  // MoveIn statuses
  checklist_pending: { label: 'Checklist Pending', color: 'bg-yellow-100 text-yellow-800' },
  active: { label: 'Active', color: 'bg-green-100 text-green-800' },
  extension_requested: { label: 'Extension Requested', color: 'bg-purple-100 text-purple-800' },
  completed: { label: 'Completed', color: 'bg-gray-100 text-gray-800' },
  // Support ticket statuses
  open: { label: 'Open', color: 'bg-red-100 text-red-800' },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  resolved: { label: 'Resolved', color: 'bg-green-100 text-green-800' },
  // Extension request
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || { label: status, color: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}
