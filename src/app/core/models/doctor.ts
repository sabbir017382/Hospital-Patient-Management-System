export interface Doctor {
  doctorId?: string;
  doctorName: string;
  name: string;
  qualification: string;
  specialty: string;
  email: string;
  phone: string;
  designation: string;
  institute: string;
  departmentName: string;
  consultationFee: number;
  OffDays: string[];
  availableDays: string[];
  chamberTime: {
    start: string;
    end: string;
  };
  floorNumber: string;
  roomNumber: number;
  branchName: string;
  branchAddress: string;
  imageUrl: string;
  availability: string;
}
