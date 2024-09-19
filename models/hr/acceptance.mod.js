export const queryApprovedPelamarByDate = `
    SELECT * FROM sumbiri_pelamar WHERE DATE(ApprovalTime) BETWEEN :startDate AND :endDate

`;