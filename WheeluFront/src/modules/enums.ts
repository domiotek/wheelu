export enum AccessLevel {
	Administrator,
	SchoolOwner,
	Instructor,
	Student,
	Anonymous,
}

export enum SchoolPageTab {
	Courses,
	Services,
	Reviews,
	Instructors,
	Vehicles,
	Contact,
}

export enum CourseCategory {
	AM,
	A,
	A1,
	A2,
	B,
	B1,
	C,
	C1,
	D,
	D1,
	T,
}

export enum VehiclePartType {
	Tires,
	Brakes,
	Clutch,
	Igniters,
	Suspension,
	Oil,
	Battery,
	Ligths,
}

export enum TransmissionType {
	Manual,
	Automatic,
}

export enum SortingType {
	Asc,
	Desc,
}

export enum AuthorizabledAccountActions {
	ChangePassword,
}

export enum CoursePageTab {
	Rides,
	Exams,
	Manage,
}

export enum RideStatus {
	Planned,
	Ongoing,
	Finished,
	Canceled,
}

export enum RequestStatus {
	Pending,
	Resolved,
	Canceled,
	Rejected,
}

export enum requestorType {
	Student, 
	Instructor
}
