export const queryApprovedPelamarByDate = `
SELECT
	IFNULL(sp.NikKTP, '') AS NikKTP,
	IFNULL(se.Nik, '') AS Nik,
	IFNULL(sp.PassKey, '') AS PassKey,
	IFNULL(UPPER(sp.FullName), '') AS NamaLengkap,
	IFNULL(sp.Position, '') AS Position,
	UPPER(sp.BirthPlace) AS TempatLahir,
	IFNULL(sp.BirthDate, '') AS TanggalLahir,
	IFNULL(sp.Phone, '') AS NoTelp1,
	IFNULL(sp.Email, '') AS Email,
	IFNULL(map2.nama_prov, '') AS KTPProvinsi,
	IFNULL(mak.nama_kabkota, '') AS AlamatKTPKabKota,
	IFNULL(mak2.nama_kecamatan, '') AS AlamatKTPKecamatan,
	IFNULL(sp.AddressKTPKelurahanID, '') AS AlamatKTPKelurahan,
	IFNULL(CONCAT('RT', sp.AddressKTPRT, '/', 'RW', sp.AddressKTPRW), '') AS AlamatKTPRTRW,
	IFNULL(sp.AddressKTPRT, '') AS AlamatRT,
    IFNULL(sp.AddressKTPRW, '') AS AlamatRW,
    IFNULL(sp.AddressKTPProvID, '') AS AlamatIDProv,
    IFNULL(sp.AddressKTPKabKotaID, '') AS AlamatIDKabKota,
    IFNULL(sp.AddressKTPKecamatanID, '') AS AlamatIDKecamatan,
    IFNULL(sp.AddressKTPKelurahanID, '') AS AlamatKelurahan,
    IFNULL(UPPER(sp.AddressKTPDetail), '') AS AlamatDetail,
	IFNULL(sp.AddressDOMRT, '') AS AddressDOMRT,
  	IFNULL(sp.AddressDOMRW, '') AS AddressDOMRW,
  	IFNULL(sp.AddressDOMProvID, '') AS AddressDOMProvID,
  	IFNULL(sp.AddressDOMKabKotaID, '') AS AddressDOMKabKotaID,
  	IFNULL(sp.AddressDOMKecamatanID, '') AS AddressDOMKecamatanID,
  	IFNULL(sp.AddressDOMKelurahanID, '') AS AddressDOMKelurahanID,
  	IFNULL(sp.AddressDOMDetail, '') AS AlamatDOMDetail,
  	CASE
    	WHEN sp.isKTPCurrent = 0 THEN CONCAT(IFNULL(sp.AddressKTPDetail, ''), ', RT', IFNULL(sp.AddressKTPRT, ''), ' RW', IFNULL(sp.AddressKTPRW, ''), ', ', IFNULL(sp.AddressKTPKelurahanID, ''), ', ', IFNULL(mak2.nama_kecamatan, ''), ', ', IFNULL(mak.nama_kabkota, ''))
    	WHEN sp.isKTPCurrent = 1 THEN CONCAT(IFNULL(sp.AddressDOMDetail, ''), ', RT ', IFNULL(sp.AddressDOMRT, ''), ' RW ', IFNULL(sp.AddressDOMRW, ''), ', ', IFNULL(sp.AddressDOMKelurahanID, ''), ', ', IFNULL(mak4.nama_kecamatan, ''), ', ', IFNULL(mak3.nama_kabkota, ''))
    	ELSE ''
	END AS AlamatDomisili,
	sp.isKTPCurrent, 
  	IFNULL(map3.nama_prov, '') AS DOMProvinsi,
	IFNULL(mak3.nama_kabkota, '') AS AlamatDOMKabKota,
	IFNULL(mak4.nama_kecamatan, '') AS AlamatDOMKecamatan,
	IFNULL(sp.AddressDOMKelurahanID, '') AS AlamatDOMKelurahan,
	IFNULL(CONCAT('RT', sp.AddressDOMRT, '/', 'RW', sp.AddressKTPRW), '') AS AlamatDOMRTRW,
	IFNULL(sp.AddressDOMDetail, '') AS AlamatDOMDetail,
  IFNULL(sp.BloodType, '') AS BloodType,
	IFNULL(sp.FatherName, '') AS NamaAyah,
	IFNULL(sp.FatherJob, '') AS PekerjaanAyah,
	IFNULL(sp.MotherName, '') AS NamaIbu,
	IFNULL(sp.MotherJob, '') AS PekerjaanIbu,
	IFNULL(sp.ParentAddress, '') AS ParentAddress,
	IFNULL(sp.ParentPhone, '') AS ParentPhone,
	sp.EduLastLevel,
	sp.EduLastName,
	sp.EduLastCity,
	sp.EduLastYear,
	sp.EduLastType,
	IFNULL(sp.EduSDName, '') AS EduSDName,
	IFNULL(sp.EduSDCity, '') AS EduSDCity,
	IFNULL(sp.EduSDYear, '') AS EduSDYear,
	IFNULL(sp.EduSDType, '') AS EduSDType,
	IFNULL(sp.EduSMPName, '') AS EduSMPName,
	IFNULL(sp.EduSMPCity, '') AS EduSMPCity,
	IFNULL(sp.EduSMPType, '') AS EduSMPType,
	IFNULL(sp.EduSMPYear, '') AS EduSMPYear,
	IFNULL(sp.EduSMAName, '') AS EduSMAName,
	IFNULL(sp.EduSMACity, '') AS EduSMACity,
	IFNULL(sp.EduSMAType, '') AS EduSMAType,
	IFNULL(sp.EduSMAYear, '') AS EduSMAYear,
	IFNULL(sp.EduD3Name, '') AS EduD3Name,
	IFNULL(sp.EduD3City, '') AS EduD3City,
	IFNULL(sp.EduD3Type, '') AS EduD3Type,
	IFNULL(sp.EduD3Year, '') AS EduD3Year,
	IFNULL(sp.EduS1Name, '') AS EduS1Name,
	IFNULL(sp.EduS1City, '') AS EduS1City,
	IFNULL(sp.EduS1Type, '') AS EduS1Type,
	IFNULL(sp.EduS1Year, '') AS EduS1Year,
	IFNULL(sp.EduLastLevel, '') AS JenjangPendidikan,
	CASE
		WHEN sp.Kursus1Topic != '' OR sp.Kursus2Topic != '' THEN 'YA'
		ELSE 'TIDAK'
	END AS isKursus,
	IFNULL(sp.Kursus1Topic, '') AS Kursus1Topic,
	IFNULL(sp.Kursus1Location, '') AS Kursus1Location,
	IFNULL(sp.Kursus1Periode, '') AS Kursus1Periode,
	IFNULL(sp.Kursus1Place, '') AS Kursus1Place,
	IFNULL(sp.Kursus2Topic, '') AS Kursus2Topic,
	IFNULL(sp.Kursus2Location, '') AS Kursus2Location,
	IFNULL(sp.Kursus2Periode, '') AS Kursus2Periode,
	IFNULL(sp.Kursus2Place, '') AS Kursus2Place,
	IFNULL(sp.Work1Name, '') AS Work1Name,
	IFNULL(sp.Work1Position, '') AS Work1Position,
	IFNULL(sp.Work1Place, '') AS Work1Place,
	IFNULL(sp.Work1Periode, '') AS Work1Periode,
	IFNULL(sp.Work1Salary, '') AS Work1Salary,
	IFNULL(sp.Work1Reason, '') AS Work1Reason,
	IFNULL(sp.Work2Name, '') AS Work2Name,
	IFNULL(sp.Work2Position, '') AS Work2Position,
	IFNULL(sp.Work2Place, '') AS Work2Place,
	IFNULL(sp.Work2Periode, '') AS Work2Periode,
	IFNULL(sp.Work2Salary, '') AS Work2Salary,
	IFNULL(sp.Work2Reason, '') AS Work2Reason,
	IFNULL(sp.Work3Name, '') AS Work3Name,
	IFNULL(sp.Work3Position, '') AS Work3Position,
	IFNULL(sp.Work3Place, '') AS Work3Place,
	IFNULL(sp.Work3Periode, '') AS Work3Periode,
	IFNULL(sp.Work3Salary, '') AS Work3Salary,
	IFNULL(sp.Work3Reason, '') AS Work3Reason,
	CASE
		WHEN sp.Org1Name != '' OR sp.Org2Name != '' OR sp.Org3Name != '' THEN 'YA'
		ELSE 'TIDAK'
	END AS isOrganisation,
	IFNULL(sp.Org1Name, '') AS Org1Name,
	IFNULL(sp.Org1Position, '') AS Org1Position,
	IFNULL(sp.Org1Periode, '') AS Org1Periode,
	IFNULL(sp.Org1Place, '') AS Org1Place,
	IFNULL(sp.Org2Name, '') AS Org2Name,
	IFNULL(sp.Org2Position, '') AS Org2Position,
	IFNULL(sp.Org2Periode, '') AS Org2Periode,
	IFNULL(sp.Org2Place, '') AS Org2Place,
	IFNULL(sp.LikeSports, '') AS LikeSports,
	IFNULL(sp.LikeArts, '') AS LikeArts,
	IFNULL(sp.LikeHobby, '') AS LikeHobby,
	IFNULL(sp.LikeVision, '') AS LikeVision,
	IFNULL(sp.SpouseName, '') AS SpouseName,
	IFNULL(sp.Child1Name, '') AS Child1Name,
	IFNULL(sp.Child1Age, '') AS Child1Age,
	IFNULL(sp.Child2Name, '') AS Child2Name,
	IFNULL(sp.Child2Age, '') AS Child2Age,
	IFNULL(sp.Child3Name, '') AS Child3Name,
	IFNULL(sp.Child3Age, '') AS Child3Age,
	IFNULL(sp.Child4Name, '') AS Child4Name,
	IFNULL(sp.Child4Age, '') AS Child4Age,
	IFNULL(sp.CountFamily, '') AS CountFamily,
	IFNULL(sp.SeqFamily, '') AS SeqFamily,
	CASE
		WHEN sp.PsikotestPlace != '' THEN 'YA'
		ELSE 'TIDAK'
	END AS isPsikotest,
	IFNULL(sp.PsikotestPlace, '') AS PsikotestPlace,
	IFNULL(sp.PsikotestTime, '') AS PsikotestTime,
	CASE
		WHEN sp.ReffName != '' THEN 'YA'
		ELSE 'TIDAK'
	END AS isReff,
	IFNULL(sp.ReffName, '') AS ReffName,
	IFNULL(sp.ReffDept, '') AS ReffDept,
	IFNULL(sp.ReffRelation, '') AS ReffRelation,
	IFNULL(sp.ExpectedSalary, '') AS ExpectedSalary,
	IFNULL(sp.ExpectedTMB, '') AS ExpectedTMB,
	CASE
		WHEN sp.isReadyContract = 1 THEN 'YA'
		ELSE 'TIDAK'
	END AS ReadyContract,
	CASE
		WHEN sp.isDocValid = 1 THEN 'YA'
		ELSE 'TIDAK'
	END AS DocValid,
	CASE
		WHEN sp.isReadyPlacement = 1 THEN 'YA'
		ELSE 'TIDAK'
	END AS ReadyPlacement,
	IFNULL(DATE(sp.CreateDate), '') AS TanggalLamaran,
  DATE_FORMAT(sp.CreateDate,'%d %M %Y')  AS TanggalLamaranText,
	IFNULL(sp.CreateDate, '') AS Timestamp,
	IFNULL(DATE_FORMAT(sp.CreateDate, '%Y-%m-%d %H:%i:%s'), '') AS CreateDate,
  se.Photos,
	sp.ApprovalStatus,
  sp.ApprovalTime,
  sp.ApprovalRemark,
  sp.ApprovalBy,
  se.CreateDate AS TanggalAcceptance
FROM
	sumbiri_pelamar sp
LEFT JOIN master_alamat_kabkota mak5 ON mak5.id_kabkota = sp.BirthPlace 
LEFT JOIN master_alamat_provinsi map2 ON map2.id_prov = sp.AddressKTPProvID 
LEFT JOIN master_alamat_kabkota mak ON mak.id_kabkota = sp.AddressKTPKabKotaID AND mak.id_prov = sp.AddressKTPProvID 
LEFT JOIN master_alamat_kecamatan mak2 ON mak2.id_kecamatan = sp.AddressKTPKecamatanID 
LEFT JOIN master_alamat_provinsi map3 ON map3.id_prov = sp.AddressDOMProvID 
LEFT JOIN master_alamat_kabkota mak3 ON mak3.id_kabkota = sp.AddressDOMKabKotaID 
LEFT JOIN master_alamat_kecamatan mak4 ON mak4.id_kecamatan = sp.AddressDOMKecamatanID 
LEFT JOIN sumbiri_employee se ON se.NikKTP = sp.NikKTP
WHERE DATE(ApprovalTime) BETWEEN :startDate AND :endDate AND ApprovalStatus=0 
`;