export interface CustomTableProps {
  columns: {
    title: string;
    isMobileVisible: boolean;
    dataIndex?: string;
    render?: (rowIndex: number, keySelector: string, rowData: any) => void;
    mobileWidth?: string;
    bigWidth?: string;
    colStyles?: string;
  }[];
  data: any;
  tableStyles?: string;
  headerStyles?: string;
  checkboxes?: boolean;
  rowStyles?: string;
  rowClick?: (row: any) => void;
  isFetching?: boolean;
}