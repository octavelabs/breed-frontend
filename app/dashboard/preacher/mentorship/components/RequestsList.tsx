"use client";

import { useCallback, useEffect, useState } from "react";
import { SearchIcon, SlidersHorizontal, RefreshCw, Inbox } from "lucide-react";
import Input from "@/app/components/Input";
import AcceptModal from "./AcceptModal";
import RejectModal from "./RejectModal";
import { mentorshipService } from "@/lib/api-services";
import Button from "@/app/components/Button";

interface MentorshipRequest {
  id: string;
  status: string;
  message?: string | null;
  createdAt: string;
  disciple: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
    username?: string;
    bio?: string | null;
  };
}

function Avatar({ user }: { user: { firstName: string; lastName: string; avatarUrl?: string | null } }) {
  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  return user.avatarUrl ? (
    <img src={user.avatarUrl} alt={user.firstName} className="w-9 h-9 rounded-full object-cover" />
  ) : (
    <div className="w-9 h-9 rounded-full bg-[#E7C8FF] flex items-center justify-center text-[#870BD6] font-bold text-sm shrink-0">
      {initials}
    </div>
  );
}

const STATUS_CLASSES: Record<string, string> = {
  PENDING:   "bg-[#FFFAEB] text-[#B54708] border border-[#FEDF89]",
  ACCEPTED:  "bg-[#ECFDF3] text-[#067647] border border-[#ABEFC6]",
  REJECTED:  "bg-[#FEF3F2] text-[#B42318] border border-[#FECDCA]",
  ACTIVE:    "bg-[#EFF8FF] text-[#175CD3] border border-[#B2DDFF]",
  COMPLETED: "bg-[#F2F4F7] text-[#344054] border border-[#D0D5DD]",
};

const RequestsList: React.FC = () => {
  const [pending, setPending] = useState<MentorshipRequest[]>([]);
  const [past, setPast] = useState<MentorshipRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingSearch, setPendingSearch] = useState("");
  const [pastSearch, setPastSearch] = useState("");
  const [selected, setSelected] = useState<MentorshipRequest | null>(null);
  const [modal, setModal] = useState<"accept" | "reject" | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      mentorshipService.getIncomingRequests({ status: "PENDING", limit: 50 }),
      mentorshipService.getIncomingRequests({ limit: 50 }),
    ])
      .then(([pendingRes, allRes]: any[]) => {
        const pendingData = pendingRes?.data ?? pendingRes;
        const allData = allRes?.data ?? allRes;
        setPending(Array.isArray(pendingData) ? pendingData : []);
        setPast(Array.isArray(allData) ? allData.filter((r: MentorshipRequest) => r.status !== "PENDING") : []);
      })
      .catch(() => { setPending([]); setPast([]); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const openModal = (req: MentorshipRequest, type: "accept" | "reject") => {
    setSelected(req);
    setModal(type);
  };

  const onModalClose = (refreshNeeded?: boolean) => {
    setModal(null);
    setSelected(null);
    if (refreshNeeded) load();
  };

  const filterList = (list: MentorshipRequest[], q: string) =>
    list.filter((r) =>
      `${r.disciple.firstName} ${r.disciple.lastName}`.toLowerCase().includes(q.toLowerCase()) ||
      (r.disciple.username ?? "").toLowerCase().includes(q.toLowerCase()),
    );

  const filteredPending = filterList(pending, pendingSearch);
  const filteredPast    = filterList(past, pastSearch);

  const RequestRow = ({ req }: { req: MentorshipRequest }) => (
    <tr className="hover:bg-[#FAFAFA] transition-colors">
      <td className="px-6 py-3">
        <div className="flex items-center gap-3">
          <Avatar user={req.disciple} />
          <div>
            <p className="font-medium text-[#180426] text-sm">{req.disciple.firstName} {req.disciple.lastName}</p>
            {req.disciple.username && <p className="text-xs text-[#60666B]">@{req.disciple.username}</p>}
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-xs text-[#60666B] max-w-[200px]">
        <p className="truncate">{req.message ?? "—"}</p>
      </td>
      <td className="px-4 py-3 text-xs text-[#60666B] whitespace-nowrap">
        {new Date(req.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
      </td>
      <td className="px-4 py-3">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_CLASSES[req.status] ?? "bg-gray-100 text-gray-600"}`}>
          {req.status.toLowerCase()}
        </span>
      </td>
      {req.status === "PENDING" && (
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <Button buttonType="custom" customClass="!h-[32px] !text-xs px-3 !bg-[#1FA564] text-white" onClick={() => openModal(req, "accept")}>
              Accept
            </Button>
            <Button buttonType="bordered" customClass="!h-[32px] !text-xs px-3 !border-red-300 !text-red-600" onClick={() => openModal(req, "reject")}>
              Reject
            </Button>
          </div>
        </td>
      )}
    </tr>
  );

  const EmptyState = ({ label }: { label: string }) => (
    <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
      <div className="w-10 h-10 rounded-full bg-[#F5EBFF] flex items-center justify-center">
        <Inbox size={18} className="text-[#870BD6]" />
      </div>
      <p className="text-sm font-semibold text-gray-700">{label}</p>
    </div>
  );

  return (
    <div className="space-y-5">
      {modal === "accept" && selected && (
        <AcceptModal isOpen onClose={onModalClose} selectedRequest={selected} />
      )}
      {modal === "reject" && selected && (
        <RejectModal isOpen onClose={onModalClose} selectedRequest={selected} />
      )}

      {/* Pending */}
      <div className="bg-white mx-4 lg:mx-10 border border-[#E3E8EF] rounded-2xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2 justify-between my-5 mx-6">
          <h2 className="text-base font-semibold text-gray-900">
            Pending Requests
            <span className="ml-2 text-[#60666B] font-normal text-sm">({filteredPending.length})</span>
          </h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Input type="text" id="pr-search" name="pr-search"
                onChange={(e) => setPendingSearch(e.target.value)} value={pendingSearch}
                placeholder="Search…" variant="outlined"
                icon={<SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50" />}
                className="!bg-white !border-[#B9C2CA] !h-[36px] rounded-full" />
            </div>
            <button onClick={load} title="Refresh" className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
              <RefreshCw size={14} className="text-gray-500" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-2 px-6 pb-6">{[1,2].map((i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}</div>
        ) : filteredPending.length === 0 ? (
          <EmptyState label="No pending requests" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F8FAFC] border-y border-[#E3E8EF]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#60666B]">Believer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#60666B]">Message</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#60666B]">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#60666B]">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#60666B]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F2F4]">
                {filteredPending.map((r) => <RequestRow key={r.id} req={r} />)}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Past */}
      <div className="bg-white mx-4 lg:mx-10 border border-[#E3E8EF] rounded-2xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2 justify-between my-5 mx-6">
          <h2 className="text-base font-semibold text-gray-900">
            Past Requests
            <span className="ml-2 text-[#60666B] font-normal text-sm">({filteredPast.length})</span>
          </h2>
          <div className="relative">
            <Input type="text" id="past-search" name="past-search"
              onChange={(e) => setPastSearch(e.target.value)} value={pastSearch}
              placeholder="Search…" variant="outlined"
              icon={<SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50" />}
              className="!bg-white !border-[#B9C2CA] !h-[36px] rounded-full" />
          </div>
        </div>

        {loading ? (
          <div className="space-y-2 px-6 pb-6">{[1,2].map((i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}</div>
        ) : filteredPast.length === 0 ? (
          <EmptyState label="No past requests" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F8FAFC] border-y border-[#E3E8EF]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#60666B]">Believer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#60666B]">Message</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#60666B]">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#60666B]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F2F4]">
                {filteredPast.map((r) => <RequestRow key={r.id} req={r} />)}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestsList;
