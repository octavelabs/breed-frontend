import { Check, MoreHorizontal, X } from "lucide-react";
import { capitalizeFirstLetter, getStatusColor } from "./commonHelpers";
import Button from "@/app/components/Button";

export const discipleHeaders = () => [
   {
      title: "Name",
  
      bigWidth: "1.7fr",
      isMobileVisible: true,
      dataIndex: "host.user",
      render: (rowIndex, key, rowData) => (
        <span className="flex items-center gap-3">
          <img
            src='/bisola.jpg'
            alt={`${rowData?.firstName}'s dp`}
            className="h-8 md:h-10 w-8 md:w-10 rounded-full"
          />
          <span className="truncate w-[80%]">
            {`${capitalizeFirstLetter(
              rowData?.Sender?.firstName ||
                rowData?.Recipient?.firstName ||
                rowData?.firstName
            )} ${capitalizeFirstLetter(
              rowData?.Sender?.lastName ||
                rowData?.Recipient?.lastName ||
                rowData?.lastName
            )}`}
          </span>
        </span>
      ),
    },
    {
      title: "Community",
      bigWidth: "1.2fr",
      isMobileVisible: false,
      dataIndex: "community",
      render: (rowIndex, key, rowData) =>
        rowData?.community
    },
    {
      title: "Session Summary",
      bigWidth: "1.2fr",
      isMobileVisible: true,
      dataIndex: "sessionSummary",
      render: (rowIndex, key, rowData) => (rowData?.sessionSummary)
    },
    {
      title: "Task Status",
      bigWidth: "1fr",
      isMobileVisible: true,
      dataIndex: "status",
      render: (rowIndex, key, rowData) => (
         <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(rowData.status)}`}>
                    {rowData.status}
                  </span>
      )
        
    },
 {
    title: "",
    bigWidth: "0.5fr",
    mobileWidth: "0.2fr",
    isMobileVisible: true,
    render: (rowIndex, key, rowData) => (
      <MoreHorizontal
        // onClick={(e) => {
        //   e.stopPropagation();
        //   renderPopover(e, rowData);
        // }}
        className="cursor-pointer rotate-90 scale-75"
      />
    ),
  }
];

export const requestHeaders = (handleButtonClick) => [
   {
      title: "Name",
  
      bigWidth: "1.7fr",
      isMobileVisible: true,
      dataIndex: "host.user",
      render: (rowIndex, key, rowData) => (
        <span className="flex items-center gap-3">
          <img
            src='/bisola.jpg'
            alt={`${rowData?.firstName}'s dp`}
            className="h-8 md:h-10 w-8 md:w-10 rounded-full"
          />
          <span className="truncate w-[80%]">
            {`${capitalizeFirstLetter(
              rowData?.Sender?.firstName ||
                rowData?.Recipient?.firstName ||
                rowData?.firstName
            )} ${capitalizeFirstLetter(
              rowData?.Sender?.lastName ||
                rowData?.Recipient?.lastName ||
                rowData?.lastName
            )}`}
          </span>
        </span>
      ),
    },
    {
      title: "Request Date",
      bigWidth: "1fr",
      isMobileVisible: false,
      dataIndex: "requestDate",
      render: (rowIndex, key, rowData) =>
        rowData?.requestDate
    },
    {
      title: "Message",
      bigWidth: "1.2fr",
      isMobileVisible: true,
      dataIndex: "sessionSummary",
      render: (rowIndex, key, rowData) => (rowData?.message)
    },
 {
    title: "",
    bigWidth: "1fr",
    mobileWidth: "0.2fr",
    isMobileVisible: true,
    render: (rowIndex, key, rowData) => (
      <div className="flex gap-3">
                  <Button buttonType="bordered" customClass="!border !border-[#E44E4E] !text-[#E44E4E] px-3 py-[7px] flex gap-[2px] items-center" onClick={() => handleButtonClick(rowData, 'reject')}>
                     <X stroke="#E44E4E" className="w-4 h-4"/> Reject
                  </Button>
                  <Button buttonType="bordered" customClass="!border !border-[#1FA564] !text-[#1FA564] px-3 py-[7px] flex gap-[2px] items-center" onClick={() => handleButtonClick(rowData, 'accept')}>
                    <Check stroke="#1FA564" className="w-4 h-4" /> Accept
                  </Button>
                  </div>
    ),
  }
];

export const pastRequestHeaders = () => [
   {
      title: "Name",
      bigWidth: "1.7fr",
      isMobileVisible: true,
      dataIndex: "host.user",
      render: (rowIndex, key, rowData) => (
        <span className="flex items-center gap-3">
          <img
            src='/bisola.jpg'
            alt={`${rowData?.firstName}'s dp`}
            className="h-8 md:h-10 w-8 md:w-10 rounded-full"
          />
          <span className="truncate w-[80%]">
            {`${capitalizeFirstLetter(
              rowData?.Sender?.firstName ||
                rowData?.Recipient?.firstName ||
                rowData?.firstName
            )} ${capitalizeFirstLetter(
              rowData?.Sender?.lastName ||
                rowData?.Recipient?.lastName ||
                rowData?.lastName
            )}`}
          </span>
        </span>
      ),
    },
    {
      title: "RequestDate",
      bigWidth: "1.2fr",
      isMobileVisible: false,
      dataIndex: 'requestDate',
      render: (rowIndex, key, rowData) =>
        rowData?.requestDate
    },
    {
      title: "Status",
      bigWidth: "1fr",
      isMobileVisible: true,
      dataIndex: "status",
      render: (rowIndex, key, rowData) => (
         <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(rowData.status)}`}>
                    {rowData.status}
                  </span>
      )
        
    },
 {
    title: "",
    bigWidth: "0.5fr",
    mobileWidth: "0.2fr",
    isMobileVisible: true,
    render: (rowIndex, key, rowData) => (
      <MoreHorizontal
        // onClick={(e) => {
        //   e.stopPropagation();
        //   renderPopover(e, rowData);
        // }}
        className="cursor-pointer rotate-90 scale-75"
      />
    ),
  }
];

export const sessionHeaders = () => [
  {
      title: "Date",
      bigWidth: "1fr",
      isMobileVisible: false,
      dataIndex: 'requestDate',
      render: (rowIndex, key, rowData) =>
        rowData?.date
    },
   {
      title: "Disciple",
      bigWidth: "1.2fr",
      isMobileVisible: true,
      dataIndex: "host.user",
      render: (rowIndex, key, rowData) => (
       <>
        {`${capitalizeFirstLetter(
                rowData?.firstName
            )} ${capitalizeFirstLetter(
                rowData?.lastName
            )}`}
            </>
      )
    },
 {
      title: "Duration",
      bigWidth: "1.2fr",
      isMobileVisible: true,
      dataIndex: "host.user",
      render: (rowIndex, key, rowData) => (
                rowData?.duration
      )
    },
 {
    title: "",
    bigWidth: "0.5fr",
    mobileWidth: "0.2fr",
    isMobileVisible: true,
    render: (rowIndex, key, rowData) => (
      <MoreHorizontal
        // onClick={(e) => {
        //   e.stopPropagation();
        //   renderPopover(e, rowData);
        // }}
        className="cursor-pointer rotate-90 scale-75"
      />
    ),
  }
];

export const recentMeetingsHeaders = () => [
  {
      title: "Date",
      bigWidth: "1fr",
      isMobileVisible: false,
      dataIndex: 'date',
      render: (rowIndex, key, rowData) =>
        rowData?.date
    },
   {
      title: "Meeting",
      bigWidth: "1.6fr",
      isMobileVisible: true,
      dataIndex: "host.user",
      render: (rowIndex, key, rowData) => (
        <div>
          <p className='text-base text-[#292A2B]'>{rowData?.meeting}</p>
          <p className="text-sm text-[#4E5255] mt-[4px]">{rowData?.community}</p>
        </div>
                
      )
    },
 {
      title: "Duration",
      bigWidth: "0.7fr",
      isMobileVisible: true,
      dataIndex: "duration",
      render: (rowIndex, key, rowData) => (
                rowData?.duration
      )
    },
     {
      title: "Attendees",
      bigWidth: "1.2fr",
      isMobileVisible: true,
      dataIndex: "attendees",
      render: (rowIndex, key, rowData) => (
                rowData?.attendees
      )
    },
 {
    title: "",
    bigWidth: "0.5fr",
    mobileWidth: "0.2fr",
    isMobileVisible: true,
    render: (rowIndex, key, rowData) => (
      <MoreHorizontal
        // onClick={(e) => {
        //   e.stopPropagation();
        //   renderPopover(e, rowData);
        // }}
        className="cursor-pointer rotate-90 scale-75"
      />
    ),
  }
];

export const communityMeetingsHeaders = () => [
 
   {
      title: "Meeting",
      bigWidth: "1.6fr",
      isMobileVisible: true,
      dataIndex: "host.user",
      render: (rowIndex, key, rowData) => (
        <div>
          <p className='text-base text-[#292A2B]'>{rowData?.meeting}</p>
          <p className="text-sm text-[#4E5255] mt-[4px]">{rowData?.community}</p>
        </div>
                
      )
    },
     {
      title: "Schedule Summary",
      bigWidth: "1.2fr",
      isMobileVisible: true,
      dataIndex: "sessionSummary",
      render: (rowIndex, key, rowData) => (rowData?.sessionSummary)
    },
 {
    title: "",
    bigWidth: "0.5fr",
    mobileWidth: "0.2fr",
    isMobileVisible: true,
    render: (rowIndex, key, rowData) => (
      <MoreHorizontal
        // onClick={(e) => {
        //   e.stopPropagation();
        //   renderPopover(e, rowData);
        // }}
        className="cursor-pointer rotate-90 scale-75"
      />
    ),
  }
];

export const openMeetingsHeaders = () => [
 
   {
      title: "Meeting",
      bigWidth: "1.6fr",
      isMobileVisible: true,
      dataIndex: "host.user",
      render: (rowIndex, key, rowData) => (
        <div>
          <p className='text-base text-[#292A2B]'>{rowData?.meeting}</p>
        </div>
                
      )
    },
     {
      title: "Commuinty",
      bigWidth: "1.2fr",
      isMobileVisible: true,
      dataIndex: "community",
      render: (rowIndex, key, rowData) => (rowData?.community)
    },
     {
      title: "Schedule Summary",
      bigWidth: "1.2fr",
      isMobileVisible: true,
      dataIndex: "sessionSummary",
      render: (rowIndex, key, rowData) => (rowData?.sessionSummary)
    },
 {
    title: "",
    bigWidth: "0.5fr",
    mobileWidth: "0.2fr",
    isMobileVisible: true,
    render: (rowIndex, key, rowData) => (
      <MoreHorizontal
        // onClick={(e) => {
        //   e.stopPropagation();
        //   renderPopover(e, rowData);
        // }}
        className="cursor-pointer rotate-90 scale-75"
      />
    ),
  }
]