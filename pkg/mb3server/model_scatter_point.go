package mb3server

type ScatterPoint struct {
	Accession         string  `json:"accession"`
	Mz                float64 `json:"mz"`
	Ccs               float64 `json:"ccs"`
	BiosyntheticClass string  `json:"biosyntheticClass"`
}
