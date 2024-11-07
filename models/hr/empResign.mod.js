export const queryEmpResignSPK = `
SELECT
	spk.id_spk,
	spk.Nik,
	se.NamaLengkap,
	se.IDDepartemen,
	md.NameDept AS NamaDepartemen,
	se.IDPosisi,
	mp.Name AS NamaPosisi,
    se.StatusKaryawan,
	se.TanggalMasuk,
	se.TanggalKeluar,
    DATE(spk.CreateDate) AS TanggalDokumen,
	spk.FlagReason,
	spk.CreateBy,
	spk.CreateDate
FROM
	sumbiri_spk spk
LEFT JOIN sumbiri_employee se ON se.Nik = spk.Nik 
LEFT JOIN master_department md ON md.IdDept = se.IDDepartemen 
LEFT JOIN master_position mp ON mp.IDPosition = se.IDPosisi 
WHERE se.TanggalKeluar BETWEEN :startDate AND :endDate
ORDER BY spk.CreateDate DESC
`;