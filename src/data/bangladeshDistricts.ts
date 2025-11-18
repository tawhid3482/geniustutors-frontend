// Types for districts, areas, and post offices
export interface District {
  id: string;
  name: string;
  areas: string[]; // simple list for quick UX (back-compat)
}

export interface PostOffice {
  name: string;
  postcode: string; // keep as string because of leading zeros in some countries
}

export interface AreaWithPostOffices {
  name: string;
  postOffices: PostOffice[];
}

export interface DistrictWithAreas {
  id: string;
  name: string;
  areas: AreaWithPostOffices[];
}

// ------------------------- ENRICHED DATASET (with area-wise post offices) -------------------------
export const BANGLADESH_DISTRICTS_WITH_POST_OFFICES: DistrictWithAreas[] = [
  // ---- DHAKA DIVISION ----
  
  // Dhaka District
  {
    id: "dhaka",
    name: "Dhaka",
    areas: [
      {
        name: "Dhanmondi",
        postOffices: [
          { name: "Jigatala TSO", postcode: "1209" },
          { name: "Dhanmondi TSO", postcode: "1205" }
        ]
      },
      {
        name: "Gulshan",
        postOffices: [
          { name: "Gulshan Model Town", postcode: "1212" },
          { name: "Gulshan TSO", postcode: "1212" }
        ]
      },
      {
        name: "Banani",
        postOffices: [
          { name: "Banani TSO", postcode: "1213" }
        ]
      },
      {
        name: "Tejgaon",
        postOffices: [
          { name: "Tejgaon Industrial Area", postcode: "1208" },
          { name: "Tejgaon TSO", postcode: "1215" }
        ]
      },
      {
        name: "Mirpur",
        postOffices: [
          { name: "Mirpur TSO (Section 1–2)", postcode: "1216" },
          { name: "Mirpur TSO (Section 6)", postcode: "1216" },
          { name: "Mirpur TSO (Section 10)", postcode: "1216" },
          { name: "Mirpur TSO (Section 11)", postcode: "1216" },
          { name: "Mirpur TSO (Section 12)", postcode: "1216" },
          { name: "Mirpur TSO (Section 13)", postcode: "1216" },
          { name: "Mirpur TSO (Section 14)", postcode: "1216" }
        ]
      },
      {
        name: "Mohammadpur",
        postOffices: [
          { name: "Mohammadpur Housing Estate", postcode: "1207" },
          { name: "Mohammadpur TSO", postcode: "1207" }
        ]
      },
      {
        name: "Uttara",
        postOffices: [
          { name: "Uttara Model Town", postcode: "1230" },
          { name: "Uttara TSO", postcode: "1230" }
        ]
      },
      {
        name: "Demra",
        postOffices: [
          { name: "Demra", postcode: "1360" },
          { name: "Sarulia", postcode: "1361" },
          { name: "Matuail", postcode: "1362" }
        ]
      },
      {
        name: "Dhaka Cantonment",
        postOffices: [
          { name: "Dhaka Cantonment TSO", postcode: "1206" }
        ]
      },
      {
        name: "Dohar (Joypara)",
        postOffices: [
          { name: "Joypara", postcode: "1330" },
          { name: "Palamganj", postcode: "1331" },
          { name: "Narisha", postcode: "1332" }
        ]
      },
      {
        name: "Dhamrai",
        postOffices: [
          { name: "Dhamrai", postcode: "1350" },
          { name: "Kamalpur (Dhamrai)", postcode: "1351" }
        ]
      },
      {
        name: "Keraniganj",
        postOffices: [
          { name: "Keraniganj", postcode: "1310" },
          { name: "Kalatia", postcode: "1311" },
          { name: "Ati", postcode: "1312" }
        ]
      },
      {
        name: "Nawabganj",
        postOffices: [
          { name: "Nawabganj", postcode: "1320" },
          { name: "Kalakandi", postcode: "1321" },
          { name: "Kusumhati", postcode: "1322" }
        ]
      },
      {
        name: "Savar",
        postOffices: [
          { name: "Savar", postcode: "1340" },
          { name: "Ashulia", postcode: "1341" },
          { name: "Dhamsona", postcode: "1342" }
        ]
      }
    ]
  },

  // Narayanganj District
  {
    id: "narayanganj",
    name: "Narayanganj",
    areas: [
      {
        name: "Narayanganj Sadar / City",
        postOffices: [
          { name: "Narayanganj Sadar", postcode: "1400" },
          { name: "Narayanganj TSO", postcode: "1400" }
        ]
      },
      {
        name: "Bandar",
        postOffices: [
          { name: "Bandar", postcode: "1410" },
          { name: "D.C. Mills", postcode: "1411" },
          { name: "Nabiganj (Bandar)", postcode: "1412" },
          { name: "BIDS (Bandar)", postcode: "1413" },
          { name: "Madanganj", postcode: "1414" }
        ]
      },
      {
        name: "Siddhirganj",
        postOffices: [
          { name: "Siddhirganj", postcode: "1430" },
          { name: "Adamjeenagar", postcode: "1431" }
        ]
      },
      {
        name: "Araihazar",
        postOffices: [
          { name: "Araihazar", postcode: "1450" },
          { name: "Gopaldi", postcode: "1451" }
        ]
      },
      {
        name: "Sonargaon / Baidyer Bazar",
        postOffices: [
          { name: "Baidder Bazar", postcode: "1440" },
          { name: "Bara Nagar", postcode: "1441" },
          { name: "Barodi", postcode: "1442" },
          { name: "Mograpara", postcode: "1445" }
        ]
      },
      {
        name: "Rupganj",
        postOffices: [
          { name: "Rupganj", postcode: "1460" },
          { name: "Nagri (Rupganj)", postcode: "1461" },
          { name: "Bhulta", postcode: "1462" },
          { name: "Murapara", postcode: "1463" },
          { name: "Kanchan", postcode: "1464" }
        ]
      }
    ]
  },

  // Gazipur District
  {
    id: "gazipur",
    name: "Gazipur",
    areas: [
      {
        name: "Gazipur Sadar / City",
        postOffices: [
          { name: "Gazipur Sadar", postcode: "1700" },
          { name: "BRRI (Bhawal Gazipur)", postcode: "1701" },
          { name: "Chandna", postcode: "1702" },
          { name: "BOF", postcode: "1703" },
          { name: "National University", postcode: "1704" }
        ]
      },
      {
        name: "Tongi",
        postOffices: [
          { name: "Tongi Head Office", postcode: "1710" },
          { name: "Tongi TSO / Tongi Bazar", postcode: "1711" }
        ]
      },
      {
        name: "Kaliakoir",
        postOffices: [
          { name: "Kaliakoir", postcode: "1750" },
          { name: "Safipur", postcode: "1751" }
        ]
      },
      {
        name: "Sreepur",
        postOffices: [
          { name: "Sreepur", postcode: "1740" },
          { name: "Barmi", postcode: "1742" }
        ]
      },
      {
        name: "Kaliganj (Gazipur)",
        postOffices: [
          { name: "Kaliganj", postcode: "1720" },
          { name: "Pubail / Jamalpur (Kaliganj)", postcode: "1721" }
        ]
      },
      {
        name: "Kapasia",
        postOffices: [
          { name: "Kapasia", postcode: "1730" },
          { name: "Tok / Toke (Kapasia)", postcode: "1731" }
        ]
      }
    ]
  },

  // Tangail District
  {
    id: "tangail",
    name: "Tangail",
    areas: [
      {
        name: "Tangail Sadar",
        postOffices: [
          { name: "Tangail Sadar", postcode: "1900" },
          { name: "Tangail TSO", postcode: "1900" }
        ]
      },
      {
        name: "Basail",
        postOffices: [
          { name: "Basail", postcode: "1950" }
        ]
      },
      {
        name: "Delduar",
        postOffices: [
          { name: "Delduar", postcode: "1910" }
        ]
      },
      {
        name: "Dighor",
        postOffices: [
          { name: "Dighor", postcode: "1920" }
        ]
      },
      {
        name: "Ghatail",
        postOffices: [
          { name: "Ghatail", postcode: "1980" }
        ]
      },
      {
        name: "Gopalpur",
        postOffices: [
          { name: "Gopalpur", postcode: "1930" }
        ]
      },
      {
        name: "Kalihati",
        postOffices: [
          { name: "Kalihati", postcode: "1940" }
        ]
      },
      {
        name: "Madhupur",
        postOffices: [
          { name: "Madhupur", postcode: "1996" }
        ]
      },
      {
        name: "Mirzapur",
        postOffices: [
          { name: "Mirzapur", postcode: "1960" }
        ]
      },
      {
        name: "Nagarpur",
        postOffices: [
          { name: "Nagarpur", postcode: "1970" }
        ]
      },
      {
        name: "Sakhipur",
        postOffices: [
          { name: "Sakhipur", postcode: "1951" }
        ]
      }
    ]
  },

  // Narsingdi District
  {
    id: "narsingdi",
    name: "Narsingdi",
    areas: [
      {
        name: "Narsingdi Sadar",
        postOffices: [
          { name: "Narsingdi Sadar", postcode: "1600" },
          { name: "Narsingdi TSO", postcode: "1600" }
        ]
      },
      {
        name: "Belabo",
        postOffices: [
          { name: "Belabo", postcode: "1640" }
        ]
      },
      {
        name: "Monohardi",
        postOffices: [
          { name: "Monohardi", postcode: "1650" }
        ]
      },
      {
        name: "Palash",
        postOffices: [
          { name: "Palash", postcode: "1660" }
        ]
      },
      {
        name: "Raipura",
        postOffices: [
          { name: "Raipura", postcode: "1670" }
        ]
      },
      {
        name: "Shibpur",
        postOffices: [
          { name: "Shibpur", postcode: "1680" }
        ]
      }
    ]
  },

  // Munshiganj District
  {
    id: "munshiganj",
    name: "Munshiganj",
    areas: [
      {
        name: "Munshiganj Sadar",
        postOffices: [
          { name: "Munshiganj Sadar", postcode: "1500" },
          { name: "Munshiganj TSO", postcode: "1500" }
        ]
      },
      {
        name: "Gazaria",
        postOffices: [
          { name: "Gazaria", postcode: "1510" }
        ]
      },
      {
        name: "Lohajang",
        postOffices: [
          { name: "Lohajang", postcode: "1520" }
        ]
      },
      {
        name: "Sirajdikhan",
        postOffices: [
          { name: "Sirajdikhan", postcode: "1530" }
        ]
      },
      {
        name: "Sreenagar",
        postOffices: [
          { name: "Sreenagar", postcode: "1540" }
        ]
      },
      {
        name: "Tongibari",
        postOffices: [
          { name: "Tongibari", postcode: "1550" }
        ]
      }
    ]
  },

  // Kishoreganj District
  {
    id: "kishoreganj",
    name: "Kishoreganj",
    areas: [
      {
        name: "Kishoreganj Sadar",
        postOffices: [
          { name: "Kishoreganj Sadar", postcode: "2300" },
          { name: "Kishoreganj TSO", postcode: "2300" }
        ]
      },
      {
        name: "Austagram",
        postOffices: [
          { name: "Austagram", postcode: "2310" }
        ]
      },
      {
        name: "Bajitpur",
        postOffices: [
          { name: "Bajitpur", postcode: "2336" }
        ]
      },
      {
        name: "Bhairab",
        postOffices: [
          { name: "Bhairab", postcode: "2350" }
        ]
      },
      {
        name: "Hossainpur",
        postOffices: [
          { name: "Hossainpur", postcode: "2360" }
        ]
      },
      {
        name: "Itna",
        postOffices: [
          { name: "Itna", postcode: "2370" }
        ]
      },
      {
        name: "Karimganj",
        postOffices: [
          { name: "Karimganj", postcode: "2380" }
        ]
      },
      {
        name: "Katiadi",
        postOffices: [
          { name: "Katiadi", postcode: "2390" }
        ]
      },
      {
        name: "Kuliarchar",
        postOffices: [
          { name: "Kuliarchar", postcode: "2391" }
        ]
      },
      {
        name: "Mithamain",
        postOffices: [
          { name: "Mithamain", postcode: "2392" }
        ]
      },
      {
        name: "Nikli",
        postOffices: [
          { name: "Nikli", postcode: "2393" }
        ]
      },
      {
        name: "Pakundia",
        postOffices: [
          { name: "Pakundia", postcode: "2394" }
        ]
      },
      {
        name: "Tarail",
        postOffices: [
          { name: "Tarail", postcode: "2395" }
        ]
      }
    ]
  },

  // Manikganj District
  {
    id: "manikganj",
    name: "Manikganj",
    areas: [
      {
        name: "Manikganj Sadar",
        postOffices: [
          { name: "Manikganj Sadar", postcode: "1800" },
          { name: "Manikganj TSO", postcode: "1800" }
        ]
      },
      {
        name: "Daulatpur",
        postOffices: [
          { name: "Daulatpur", postcode: "1810" }
        ]
      },
      {
        name: "Ghior",
        postOffices: [
          { name: "Ghior", postcode: "1820" }
        ]
      },
      {
        name: "Harirampur",
        postOffices: [
          { name: "Harirampur", postcode: "1830" }
        ]
      },
      {
        name: "Saturia",
        postOffices: [
          { name: "Saturia", postcode: "1840" }
        ]
      },
      {
        name: "Shibalaya",
        postOffices: [
          { name: "Shibalaya", postcode: "1850" }
        ]
      },
      {
        name: "Singair",
        postOffices: [
          { name: "Singair", postcode: "1860" }
        ]
      }
    ]
  },

  // Faridpur District
  {
    id: "faridpur",
    name: "Faridpur",
    areas: [
      {
        name: "Faridpur Sadar",
        postOffices: [
          { name: "Faridpur Sadar", postcode: "7800" },
          { name: "Faridpur TSO", postcode: "7800" }
        ]
      },
      {
        name: "Alfadanga",
        postOffices: [
          { name: "Alfadanga", postcode: "7810" }
        ]
      },
      {
        name: "Bhanga",
        postOffices: [
          { name: "Bhanga", postcode: "7820" }
        ]
      },
      {
        name: "Boalmari",
        postOffices: [
          { name: "Boalmari", postcode: "7830" }
        ]
      },
      {
        name: "Charbhadrasan",
        postOffices: [
          { name: "Charbhadrasan", postcode: "7840" }
        ]
      },
      {
        name: "Madhukhali",
        postOffices: [
          { name: "Madhukhali", postcode: "7850" }
        ]
      },
      {
        name: "Nagarkanda",
        postOffices: [
          { name: "Nagarkanda", postcode: "7860" }
        ]
      },
      {
        name: "Sadarpur",
        postOffices: [
          { name: "Sadarpur", postcode: "7870" }
        ]
      },
      {
        name: "Saltha",
        postOffices: [
          { name: "Saltha", postcode: "7880" }
        ]
      }
    ]
  },

  // Rajbari District
  {
    id: "rajbari",
    name: "Rajbari",
    areas: [
      {
        name: "Rajbari Sadar",
        postOffices: [
          { name: "Rajbari Sadar", postcode: "7700" },
          { name: "Rajbari TSO", postcode: "7700" }
        ]
      },
      {
        name: "Baliakandi",
        postOffices: [
          { name: "Baliakandi", postcode: "7710" }
        ]
      },
      {
        name: "Goalandaghat",
        postOffices: [
          { name: "Goalandaghat", postcode: "7720" }
        ]
      },
      {
        name: "Pangsha",
        postOffices: [
          { name: "Pangsha", postcode: "7730" }
        ]
      }
    ]
  },

  // Madaripur District
  {
    id: "madaripur",
    name: "Madaripur",
    areas: [
      {
        name: "Madaripur Sadar",
        postOffices: [
          { name: "Madaripur Sadar", postcode: "7900" },
          { name: "Madaripur TSO", postcode: "7900" }
        ]
      },
      {
        name: "Kalkini",
        postOffices: [
          { name: "Kalkini", postcode: "7910" }
        ]
      },
      {
        name: "Rajoir",
        postOffices: [
          { name: "Rajoir", postcode: "7920" }
        ]
      },
      {
        name: "Shibchar",
        postOffices: [
          { name: "Shibchar", postcode: "7930" }
        ]
      }
    ]
  },

  // Gopalganj District
  {
    id: "gopalganj",
    name: "Gopalganj",
    areas: [
      {
        name: "Gopalganj Sadar",
        postOffices: [
          { name: "Gopalganj Sadar", postcode: "8100" },
          { name: "Gopalganj TSO", postcode: "8100" }
        ]
      },
      {
        name: "Kashiani",
        postOffices: [
          { name: "Kashiani", postcode: "8110" }
        ]
      },
      {
        name: "Kotalipara",
        postOffices: [
          { name: "Kotalipara", postcode: "8120" }
        ]
      },
      {
        name: "Muksudpur",
        postOffices: [
          { name: "Muksudpur", postcode: "8130" }
        ]
      },
      {
        name: "Tungipara",
        postOffices: [
          { name: "Tungipara", postcode: "8140" }
        ]
      }
    ]
  },

  // Shariatpur District
  {
    id: "shariatpur",
    name: "Shariatpur",
    areas: [
      {
        name: "Shariatpur Sadar",
        postOffices: [
          { name: "Shariatpur Sadar", postcode: "8000" },
          { name: "Shariatpur TSO", postcode: "8000" }
        ]
      },
      {
        name: "Bhedarganj",
        postOffices: [
          { name: "Bhedarganj", postcode: "8010" }
        ]
      },
      {
        name: "Damudya",
        postOffices: [
          { name: "Damudya", postcode: "8020" }
        ]
      },
      {
        name: "Gosairhat",
        postOffices: [
          { name: "Gosairhat", postcode: "8030" }
        ]
      },
      {
        name: "Naria",
        postOffices: [
          { name: "Naria", postcode: "8040" }
        ]
      },
      {
        name: "Zanjira",
        postOffices: [
          { name: "Zanjira", postcode: "8050" }
        ]
              }
      ]
    },

    // ---- CHITTAGONG DIVISION ----

    // Chattogram District
    {
      id: "chattogram",
      name: "Chattogram",
      areas: [
        {
          name: "Agrabad / Double Mooring",
          postOffices: [
            { name: "Agrabad C/A", postcode: "4100" }
          ]
        },
        {
          name: "Kotwali / Anderkilla",
          postOffices: [
            { name: "Anderkilla / Kotwali", postcode: "4000" }
          ]
        },
        {
          name: "Pahartali",
          postOffices: [
            { name: "Pahartali TSO / Pahartali", postcode: "4202" }
          ]
        },
        {
          name: "Chawkbazar",
          postOffices: [
            { name: "Chawkbazar (Chattogram)", postcode: "4203" }
          ]
        },
        {
          name: "Halishahar",
          postOffices: [
            { name: "Halishahar", postcode: "4216" }
          ]
        },
        {
          name: "Patenga",
          postOffices: [
            { name: "Patenga", postcode: "4204" }
          ]
        },
        {
          name: "Anwara",
          postOffices: [
            { name: "Anwara", postcode: "4376" }
          ]
        },
        {
          name: "Banshkhali",
          postOffices: [
            { name: "Banshkhali", postcode: "4390" }
          ]
        },
        {
          name: "Boalkhali",
          postOffices: [
            { name: "Boalkhali", postcode: "4366" }
          ]
        },
        {
          name: "Chandanaish",
          postOffices: [
            { name: "Chandanaish", postcode: "4386" }
          ]
        },
        {
          name: "Fatikchhari",
          postOffices: [
            { name: "Fatikchhari", postcode: "4350" }
          ]
        },
        {
          name: "Hathazari",
          postOffices: [
            { name: "Hathazari", postcode: "4330" }
          ]
        },
        {
          name: "Lohagara",
          postOffices: [
            { name: "Lohagara", postcode: "4396" }
          ]
        },
        {
          name: "Mirsharai",
          postOffices: [
            { name: "Mirsharai", postcode: "4320" }
          ]
        },
        {
          name: "Patiya",
          postOffices: [
            { name: "Patiya", postcode: "4370" }
          ]
        },
        {
          name: "Rangunia",
          postOffices: [
            { name: "Rangunia", postcode: "4360" }
          ]
        },
        {
          name: "Raozan",
          postOffices: [
            { name: "Raozan", postcode: "4340" }
          ]
        },
        {
          name: "Sandwip",
          postOffices: [
            { name: "Sandwip", postcode: "4300" }
          ]
        },
        {
          name: "Satkania",
          postOffices: [
            { name: "Satkania", postcode: "4380" }
          ]
        },
        {
          name: "Sitakunda",
          postOffices: [
            { name: "Sitakunda", postcode: "4310" }
          ]
        }
      ]
    },

    // Cumilla District
    {
      id: "cumilla",
      name: "Cumilla",
      areas: [
        {
          name: "Cumilla Sadar / City",
          postOffices: [
            { name: "Comilla Sadar", postcode: "3500" },
            { name: "Comilla Cantonment", postcode: "3501" },
            { name: "Halimanagar", postcode: "3502" },
            { name: "Courtbari", postcode: "3503" },
            { name: "Suaganj", postcode: "3504" }
          ]
        },
        {
          name: "Daudkandi",
          postOffices: [
            { name: "Daudkandi", postcode: "3516" },
            { name: "Gouripur (Daudkandi)", postcode: "3517" },
            { name: "Dashpara", postcode: "3518" },
            { name: "Eliotganj", postcode: "3519" }
          ]
        },
        {
          name: "Chandina",
          postOffices: [
            { name: "Chandina (Chandia)", postcode: "3510" },
            { name: "Madhaiabazar", postcode: "3511" }
          ]
        },
        {
          name: "Burichong",
          postOffices: [
            { name: "Burichang / Burichong", postcode: "3520" },
            { name: "Maynamati Bazar", postcode: "3521" }
          ]
        },
        {
          name: "Laksam",
          postOffices: [
            { name: "Laksam", postcode: "3570" },
            { name: "Bipulasar", postcode: "3572" }
          ]
        },
        {
          name: "Barura",
          postOffices: [
            { name: "Barura", postcode: "3560" }
          ]
        },
        {
          name: "Brahmanpara",
          postOffices: [
            { name: "Brahmanpara", postcode: "3526" }
          ]
        },
        {
          name: "Chauddagram",
          postOffices: [
            { name: "Chauddagram", postcode: "3530" }
          ]
        },
        {
          name: "Homna",
          postOffices: [
            { name: "Homna", postcode: "3546" }
          ]
        },
        {
          name: "Laksham",
          postOffices: [
            { name: "Laksham", postcode: "3570" }
          ]
        },
        {
          name: "Meghna",
          postOffices: [
            { name: "Meghna", postcode: "3550" }
          ]
        },
        {
          name: "Monoharganj",
          postOffices: [
            { name: "Monoharganj", postcode: "3551" }
          ]
        },
        {
          name: "Muradnagar",
          postOffices: [
            { name: "Muradnagar", postcode: "3566" }
          ]
        },
        {
          name: "Nangalkot",
          postOffices: [
            { name: "Nangalkot", postcode: "3580" }
          ]
        },
        {
          name: "Titas",
          postOffices: [
            { name: "Titas", postcode: "3514" }
          ]
        }
      ]
    },

    // Brahmanbaria District
    {
      id: "brahmanbaria",
      name: "Brahmanbaria",
      areas: [
        {
          name: "Brahmanbaria Sadar",
          postOffices: [
            { name: "Brahmanbaria Sadar", postcode: "3400" },
            { name: "Brahmanbaria TSO", postcode: "3400" }
          ]
        },
        {
          name: "Akhaura",
          postOffices: [
            { name: "Akhaura", postcode: "3450" }
          ]
        },
        {
          name: "Bancharampur",
          postOffices: [
            { name: "Bancharampur", postcode: "3420" }
          ]
        },
        {
          name: "Kasba",
          postOffices: [
            { name: "Kasba", postcode: "3460" }
          ]
        },
        {
          name: "Nabinagar",
          postOffices: [
            { name: "Nabinagar", postcode: "3440" }
          ]
        },
        {
          name: "Nasirnagar",
          postOffices: [
            { name: "Nasirnagar", postcode: "3430" }
          ]
        },
        {
          name: "Sarail",
          postOffices: [
            { name: "Sarail", postcode: "3410" }
          ]
        }
      ]
    },

    // Chandpur District
    {
      id: "chandpur",
      name: "Chandpur",
      areas: [
        {
          name: "Chandpur Sadar",
          postOffices: [
            { name: "Chandpur Sadar", postcode: "3600" },
            { name: "Chandpur TSO", postcode: "3600" }
          ]
        },
        {
          name: "Faridganj",
          postOffices: [
            { name: "Faridganj", postcode: "3650" }
          ]
        },
        {
          name: "Haimchar",
          postOffices: [
            { name: "Haimchar", postcode: "3660" }
          ]
        },
        {
          name: "Hajiganj",
          postOffices: [
            { name: "Hajiganj", postcode: "3610" }
          ]
        },
        {
          name: "Kachua",
          postOffices: [
            { name: "Kachua", postcode: "3630" }
          ]
        },
        {
          name: "Matlab Dakshin",
          postOffices: [
            { name: "Matlab Dakshin", postcode: "3640" }
          ]
        },
        {
          name: "Matlab Uttar",
          postOffices: [
            { name: "Matlab Uttar", postcode: "3641" }
          ]
        },
        {
          name: "Shahrasti",
          postOffices: [
            { name: "Shahrasti", postcode: "3620" }
          ]
        }
      ]
    },

    // Lakshmipur District
    {
      id: "lakshmipur",
      name: "Lakshmipur",
      areas: [
        {
          name: "Lakshmipur Sadar",
          postOffices: [
            { name: "Lakshmipur Sadar", postcode: "3700" },
            { name: "Lakshmipur TSO", postcode: "3700" }
          ]
        },
        {
          name: "Kamalnagar",
          postOffices: [
            { name: "Kamalnagar", postcode: "3720" }
          ]
        },
        {
          name: "Raipur",
          postOffices: [
            { name: "Raipur", postcode: "3730" }
          ]
        },
        {
          name: "Ramganj",
          postOffices: [
            { name: "Ramganj", postcode: "3710" }
          ]
        },
        {
          name: "Ramgati",
          postOffices: [
            { name: "Ramgati", postcode: "3740" }
          ]
        }
      ]
    },

    // Noakhali District
    {
      id: "noakhali",
      name: "Noakhali",
      areas: [
        {
          name: "Noakhali Sadar",
          postOffices: [
            { name: "Noakhali Sadar", postcode: "3800" },
            { name: "Noakhali TSO", postcode: "3800" }
          ]
        },
        {
          name: "Begumganj",
          postOffices: [
            { name: "Begumganj", postcode: "3820" }
          ]
        },
        {
          name: "Chatkhil",
          postOffices: [
            { name: "Chatkhil", postcode: "3870" }
          ]
        },
        {
          name: "Companiganj",
          postOffices: [
            { name: "Companiganj", postcode: "3860" }
          ]
        },
        {
          name: "Hatiya",
          postOffices: [
            { name: "Hatiya", postcode: "3890" }
          ]
        },
        {
          name: "Kabirhat",
          postOffices: [
            { name: "Kabirhat", postcode: "3880" }
          ]
        },
        {
          name: "Senbagh",
          postOffices: [
            { name: "Senbagh", postcode: "3850" }
          ]
        },
        {
          name: "Sonaimuri",
          postOffices: [
            { name: "Sonaimuri", postcode: "3830" }
          ]
        },
        {
          name: "Subarnachar",
          postOffices: [
            { name: "Subarnachar", postcode: "3840" }
          ]
        }
      ]
    },

    // Feni District
    {
      id: "feni",
      name: "Feni",
      areas: [
        {
          name: "Feni Sadar",
          postOffices: [
            { name: "Feni Sadar", postcode: "3900" },
            { name: "Feni TSO", postcode: "3900" }
          ]
        },
        {
          name: "Chhagalnaiya",
          postOffices: [
            { name: "Chhagalnaiya", postcode: "3910" }
          ]
        },
        {
          name: "Daganbhuiyan",
          postOffices: [
            { name: "Daganbhuiyan", postcode: "3920" }
          ]
        },
        {
          name: "Parshuram",
          postOffices: [
            { name: "Parshuram", postcode: "3930" }
          ]
        },
        {
          name: "Sonagazi",
          postOffices: [
            { name: "Sonagazi", postcode: "3940" }
          ]
        }
      ]
    },

    // Cox's Bazar District
    {
      id: "coxs-bazar",
      name: "Cox's Bazar",
      areas: [
        {
          name: "Cox's Bazar Sadar",
          postOffices: [
            { name: "Cox's Bazar Sadar", postcode: "4700" },
            { name: "Cox's Bazar TSO", postcode: "4700" }
          ]
        },
        {
          name: "Chakaria",
          postOffices: [
            { name: "Chakaria", postcode: "4740" }
          ]
        },
        {
          name: "Kutubdia",
          postOffices: [
            { name: "Kutubdia", postcode: "4720" }
          ]
        },
        {
          name: "Maheshkhali",
          postOffices: [
            { name: "Maheshkhali", postcode: "4730" }
          ]
        },
        {
          name: "Pekua",
          postOffices: [
            { name: "Pekua", postcode: "4750" }
          ]
        },
        {
          name: "Ramu",
          postOffices: [
            { name: "Ramu", postcode: "4710" }
          ]
        },
        {
          name: "Teknaf",
          postOffices: [
            { name: "Teknaf", postcode: "4760" }
          ]
        },
        {
          name: "Ukhia",
          postOffices: [
            { name: "Ukhia", postcode: "4761" }
          ]
        }
      ]
    },

    // Rangamati District
    {
      id: "rangamati",
      name: "Rangamati",
      areas: [
        {
          name: "Rangamati Sadar",
          postOffices: [
            { name: "Rangamati Sadar", postcode: "4500" },
            { name: "Rangamati TSO", postcode: "4500" }
          ]
        },
        {
          name: "Bagaichhari",
          postOffices: [
            { name: "Bagaichhari", postcode: "4510" }
          ]
        },
        {
          name: "Barkal",
          postOffices: [
            { name: "Barkal", postcode: "4520" }
          ]
        },
        {
          name: "Belaichhari",
          postOffices: [
            { name: "Belaichhari", postcode: "4530" }
          ]
        },
        {
          name: "Juraichhari",
          postOffices: [
            { name: "Juraichhari", postcode: "4540" }
          ]
        },
        {
          name: "Kaptai",
          postOffices: [
            { name: "Kaptai", postcode: "4550" }
          ]
        },
        {
          name: "Kawkhali",
          postOffices: [
            { name: "Kawkhali", postcode: "4560" }
          ]
        },
        {
          name: "Langadu",
          postOffices: [
            { name: "Langadu", postcode: "4570" }
          ]
        },
        {
          name: "Naniarchar",
          postOffices: [
            { name: "Naniarchar", postcode: "4580" }
          ]
        },
        {
          name: "Rajasthali",
          postOffices: [
            { name: "Rajasthali", postcode: "4590" }
          ]
        }
      ]
    },

    // Bandarban District
    {
      id: "bandarban",
      name: "Bandarban",
      areas: [
        {
          name: "Bandarban Sadar",
          postOffices: [
            { name: "Bandarban Sadar", postcode: "4600" },
            { name: "Bandarban TSO", postcode: "4600" }
          ]
        },
        {
          name: "Alikadam",
          postOffices: [
            { name: "Alikadam", postcode: "4610" }
          ]
        },
        {
          name: "Lama",
          postOffices: [
            { name: "Lama", postcode: "4620" }
          ]
        },
        {
          name: "Naikhongchhari",
          postOffices: [
            { name: "Naikhongchhari", postcode: "4630" }
          ]
        },
        {
          name: "Rowangchhari",
          postOffices: [
            { name: "Rowangchhari", postcode: "4640" }
          ]
        },
        {
          name: "Ruma",
          postOffices: [
            { name: "Ruma", postcode: "4650" }
          ]
        },
        {
          name: "Thanchi",
          postOffices: [
            { name: "Thanchi", postcode: "4660" }
          ]
        }
      ]
    },

    // Khagrachhari District
    {
      id: "khagrachhari",
      name: "Khagrachhari",
      areas: [
        {
          name: "Khagrachhari Sadar",
          postOffices: [
            { name: "Khagrachhari Sadar", postcode: "4400" },
            { name: "Khagrachhari TSO", postcode: "4400" }
          ]
        },
        {
          name: "Dighinala",
          postOffices: [
            { name: "Dighinala", postcode: "4410" }
          ]
        },
        {
          name: "Lakshmichhari",
          postOffices: [
            { name: "Lakshmichhari", postcode: "4420" }
          ]
        },
        {
          name: "Mahalchhari",
          postOffices: [
            { name: "Mahalchhari", postcode: "4430" }
          ]
        },
        {
          name: "Manikchhari",
          postOffices: [
            { name: "Manikchhari", postcode: "4440" }
          ]
        },
        {
          name: "Matiranga",
          postOffices: [
            { name: "Matiranga", postcode: "4450" }
          ]
        },
        {
          name: "Panchhari",
          postOffices: [
            { name: "Panchhari", postcode: "4460" }
          ]
        },
        {
          name: "Ramgarh",
          postOffices: [
            { name: "Ramgarh", postcode: "4470" }
          ]
        }
      ]
    },

    // ---- SYLHET DIVISION ----

    // Sylhet District
    {
      id: "sylhet",
      name: "Sylhet",
      areas: [
        {
          name: "Sylhet Sadar / City",
          postOffices: [
            { name: "Sylhet Sadar (GPO)", postcode: "3100" },
            { name: "Jalalabad Cantonment", postcode: "3104" },
            { name: "Khadimnagar", postcode: "3103" },
            { name: "Birahimpur", postcode: "3106" },
            { name: "Kadamtali", postcode: "3111" },
            { name: "Lalbazar", postcode: "3113" }
          ]
        },
        {
          name: "Beanibazar",
          postOffices: [
            { name: "Beanibazar", postcode: "3170" },
            { name: "Mathiura", postcode: "3172" },
            { name: "Kurar Bazar", postcode: "3173" }
          ]
        },
        {
          name: "Bishwanath",
          postOffices: [
            { name: "Bishwanath", postcode: "3130" },
            { name: "Dashghar", postcode: "3131" }
          ]
        },
        {
          name: "Jaintiapur / Gowainghat",
          postOffices: [
            { name: "Jaflong (Gowainghat)", postcode: "3151" },
            { name: "Gowainghat", postcode: "3150" }
          ]
        },
        {
          name: "Balaganj",
          postOffices: [
            { name: "Balaganj", postcode: "3120" }
          ]
        },
        {
          name: "Biswanath",
          postOffices: [
            { name: "Biswanath", postcode: "3130" }
          ]
        },
        {
          name: "Companiganj",
          postOffices: [
            { name: "Companiganj", postcode: "3140" }
          ]
        },
        {
          name: "Dakshin Surma",
          postOffices: [
            { name: "Dakshin Surma", postcode: "3110" }
          ]
        },
        {
          name: "Fenchuganj",
          postOffices: [
            { name: "Fenchuganj", postcode: "3160" }
          ]
        },
        {
          name: "Golapganj",
          postOffices: [
            { name: "Golapganj", postcode: "3171" }
          ]
        },
        {
          name: "Gowainghat",
          postOffices: [
            { name: "Gowainghat", postcode: "3150" }
          ]
        },
        {
          name: "Jaintiapur",
          postOffices: [
            { name: "Jaintiapur", postcode: "3151" }
          ]
        },
        {
          name: "Kanaighat",
          postOffices: [
            { name: "Kanaighat", postcode: "3180" }
          ]
        },
        {
          name: "Osmani Nagar",
          postOffices: [
            { name: "Osmani Nagar", postcode: "3114" }
          ]
        },
        {
          name: "Uttar Surma",
          postOffices: [
            { name: "Uttar Surma", postcode: "3112" }
          ]
        }
      ]
    },

    // Moulvibazar District
    {
      id: "moulvibazar",
      name: "Moulvibazar",
      areas: [
        {
          name: "Moulvibazar Sadar",
          postOffices: [
            { name: "Moulvibazar Sadar", postcode: "3200" },
            { name: "Moulvibazar TSO", postcode: "3200" }
          ]
        },
        {
          name: "Barlekha",
          postOffices: [
            { name: "Barlekha", postcode: "3250" }
          ]
        },
        {
          name: "Juri",
          postOffices: [
            { name: "Juri", postcode: "3260" }
          ]
        },
        {
          name: "Kamalganj",
          postOffices: [
            { name: "Kamalganj", postcode: "3210" }
          ]
        },
        {
          name: "Kulaura",
          postOffices: [
            { name: "Kulaura", postcode: "3220" }
          ]
        },
        {
          name: "Rajnagar",
          postOffices: [
            { name: "Rajnagar", postcode: "3230" }
          ]
        },
        {
          name: "Sreemangal",
          postOffices: [
            { name: "Sreemangal", postcode: "3240" }
          ]
        }
      ]
    },

    // Habiganj District
    {
      id: "habiganj",
      name: "Habiganj",
      areas: [
        {
          name: "Habiganj Sadar",
          postOffices: [
            { name: "Habiganj Sadar", postcode: "3300" },
            { name: "Habiganj TSO", postcode: "3300" }
          ]
        },
        {
          name: "Ajmiriganj",
          postOffices: [
            { name: "Ajmiriganj", postcode: "3310" }
          ]
        },
        {
          name: "Bahubal",
          postOffices: [
            { name: "Bahubal", postcode: "3320" }
          ]
        },
        {
          name: "Baniyachong",
          postOffices: [
            { name: "Baniyachong", postcode: "3330" }
          ]
        },
        {
          name: "Chunarughat",
          postOffices: [
            { name: "Chunarughat", postcode: "3340" }
          ]
        },
        {
          name: "Lakhai",
          postOffices: [
            { name: "Lakhai", postcode: "3350" }
          ]
        },
        {
          name: "Madhabpur",
          postOffices: [
            { name: "Madhabpur", postcode: "3360" }
          ]
        },
        {
          name: "Nabiganj",
          postOffices: [
            { name: "Nabiganj", postcode: "3370" }
          ]
        }
      ]
    },

    // Sunamganj District
    {
      id: "sunamganj",
      name: "Sunamganj",
      areas: [
        {
          name: "Sunamganj Sadar",
          postOffices: [
            { name: "Sunamganj Sadar", postcode: "3000" },
            { name: "Sunamganj TSO", postcode: "3000" }
          ]
        },
        {
          name: "Bishwamvarpur",
          postOffices: [
            { name: "Bishwamvarpur", postcode: "3010" }
          ]
        },
        {
          name: "Chhatak",
          postOffices: [
            { name: "Chhatak", postcode: "3020" }
          ]
        },
        {
          name: "Derai",
          postOffices: [
            { name: "Derai", postcode: "3030" }
          ]
        },
        {
          name: "Dharampasha",
          postOffices: [
            { name: "Dharampasha", postcode: "3040" }
          ]
        },
        {
          name: "Dowarabazar",
          postOffices: [
            { name: "Dowarabazar", postcode: "3050" }
          ]
        },
        {
          name: "Jagannathpur",
          postOffices: [
            { name: "Jagannathpur", postcode: "3060" }
          ]
        },
        {
          name: "Jamalganj",
          postOffices: [
            { name: "Jamalganj", postcode: "3070" }
          ]
        },
        {
          name: "Sullah",
          postOffices: [
            { name: "Sullah", postcode: "3080" }
          ]
        },
        {
          name: "Tahirpur",
          postOffices: [
            { name: "Tahirpur", postcode: "3090" }
          ]
        }
      ]
    },

    // ---- RAJSHAHI DIVISION ----

    // Rajshahi District
    {
      id: "rajshahi",
      name: "Rajshahi",
      areas: [
        {
          name: "Rajshahi Sadar",
          postOffices: [
            { name: "Rajshahi Sadar", postcode: "6000" },
            { name: "Rajshahi TSO", postcode: "6000" }
          ]
        },
        {
          name: "Bagha",
          postOffices: [
            { name: "Bagha", postcode: "6280" }
          ]
        },
        {
          name: "Bagmara",
          postOffices: [
            { name: "Bagmara", postcode: "6210" }
          ]
        },
        {
          name: "Charghat",
          postOffices: [
            { name: "Charghat", postcode: "6270" }
          ]
        },
        {
          name: "Durgapur",
          postOffices: [
            { name: "Durgapur", postcode: "6220" }
          ]
        },
        {
          name: "Godagari",
          postOffices: [
            { name: "Godagari", postcode: "6230" }
          ]
        },
        {
          name: "Mohanpur",
          postOffices: [
            { name: "Mohanpur", postcode: "6240" }
          ]
        },
        {
          name: "Paba",
          postOffices: [
            { name: "Paba", postcode: "6250" }
          ]
        },
        {
          name: "Puthia",
          postOffices: [
            { name: "Puthia", postcode: "6260" }
          ]
        },
        {
          name: "Tanore",
          postOffices: [
            { name: "Tanore", postcode: "6290" }
          ]
        }
      ]
    },

    // Bogura District
    {
      id: "bogura",
      name: "Bogura",
      areas: [
        {
          name: "Bogura Sadar",
          postOffices: [
            { name: "Bogura Sadar", postcode: "5800" },
            { name: "Bogura TSO", postcode: "5800" }
          ]
        },
        {
          name: "Adamdighi",
          postOffices: [
            { name: "Adamdighi", postcode: "5810" }
          ]
        },
        {
          name: "Dhunat",
          postOffices: [
            { name: "Dhunat", postcode: "5820" }
          ]
        },
        {
          name: "Gabtali",
          postOffices: [
            { name: "Gabtali", postcode: "5830" }
          ]
        },
        {
          name: "Kahaloo",
          postOffices: [
            { name: "Kahaloo", postcode: "5840" }
          ]
        },
        {
          name: "Nandigram",
          postOffices: [
            { name: "Nandigram", postcode: "5850" }
          ]
        },
        {
          name: "Sariakandi",
          postOffices: [
            { name: "Sariakandi", postcode: "5860" }
          ]
        },
        {
          name: "Shabganj",
          postOffices: [
            { name: "Shabganj", postcode: "5870" }
          ]
        },
        {
          name: "Sherpur",
          postOffices: [
            { name: "Sherpur", postcode: "5880" }
          ]
        },
        {
          name: "Shibganj",
          postOffices: [
            { name: "Shibganj", postcode: "5890" }
          ]
        },
        {
          name: "Sonatola",
          postOffices: [
            { name: "Sonatola", postcode: "5891" }
          ]
        }
      ]
    },

    // Joypurhat District
    {
      id: "joypurhat",
      name: "Joypurhat",
      areas: [
        {
          name: "Joypurhat Sadar",
          postOffices: [
            { name: "Joypurhat Sadar", postcode: "5900" },
            { name: "Joypurhat TSO", postcode: "5900" }
          ]
        },
        {
          name: "Akkelpur",
          postOffices: [
            { name: "Akkelpur", postcode: "5910" }
          ]
        },
        {
          name: "Kalai",
          postOffices: [
            { name: "Kalai", postcode: "5920" }
          ]
        },
        {
          name: "Khetlal",
          postOffices: [
            { name: "Khetlal", postcode: "5930" }
          ]
        },
        {
          name: "Panchbibi",
          postOffices: [
            { name: "Panchbibi", postcode: "5940" }
          ]
        }
      ]
    },

    // Naogaon District
    {
      id: "naogaon",
      name: "Naogaon",
      areas: [
        {
          name: "Naogaon Sadar",
          postOffices: [
            { name: "Naogaon Sadar", postcode: "6500" },
            { name: "Naogaon TSO", postcode: "6500" }
          ]
        },
        {
          name: "Atrai",
          postOffices: [
            { name: "Atrai", postcode: "6510" }
          ]
        },
        {
          name: "Badalgachhi",
          postOffices: [
            { name: "Badalgachhi", postcode: "6520" }
          ]
        },
        {
          name: "Dhamoirhat",
          postOffices: [
            { name: "Dhamoirhat", postcode: "6530" }
          ]
        },
        {
          name: "Manda",
          postOffices: [
            { name: "Manda", postcode: "6540" }
          ]
        },
        {
          name: "Mohadevpur",
          postOffices: [
            { name: "Mohadevpur", postcode: "6550" }
          ]
        },
        {
          name: "Niamatpur",
          postOffices: [
            { name: "Niamatpur", postcode: "6560" }
          ]
        },
        {
          name: "Patnitala",
          postOffices: [
            { name: "Patnitala", postcode: "6570" }
          ]
        },
        {
          name: "Porsha",
          postOffices: [
            { name: "Porsha", postcode: "6580" }
          ]
        },
        {
          name: "Raninagar",
          postOffices: [
            { name: "Raninagar", postcode: "6590" }
          ]
        },
        {
          name: "Sapahar",
          postOffices: [
            { name: "Sapahar", postcode: "6591" }
          ]
        }
      ]
    },

    // Natore District
    {
      id: "natore",
      name: "Natore",
      areas: [
        {
          name: "Natore Sadar",
          postOffices: [
            { name: "Natore Sadar", postcode: "6400" },
            { name: "Natore TSO", postcode: "6400" }
          ]
        },
        {
          name: "Bagatipara",
          postOffices: [
            { name: "Bagatipara", postcode: "6410" }
          ]
        },
        {
          name: "Baraigram",
          postOffices: [
            { name: "Baraigram", postcode: "6420" }
          ]
        },
        {
          name: "Gurudaspur",
          postOffices: [
            { name: "Gurudaspur", postcode: "6430" }
          ]
        },
        {
          name: "Lalpur",
          postOffices: [
            { name: "Lalpur", postcode: "6440" }
          ]
        },
        {
          name: "Singra",
          postOffices: [
            { name: "Singra", postcode: "6450" }
          ]
        }
      ]
    },

    // Chapainawabganj District
    {
      id: "chapainawabganj",
      name: "Chapainawabganj",
      areas: [
        {
          name: "Chapainawabganj Sadar",
          postOffices: [
            { name: "Chapainawabganj Sadar", postcode: "6300" },
            { name: "Chapainawabganj TSO", postcode: "6300" }
          ]
        },
        {
          name: "Bholahat",
          postOffices: [
            { name: "Bholahat", postcode: "6310" }
          ]
        },
        {
          name: "Gomastapur",
          postOffices: [
            { name: "Gomastapur", postcode: "6320" }
          ]
        },
        {
          name: "Nachole",
          postOffices: [
            { name: "Nachole", postcode: "6330" }
          ]
        },
        {
          name: "Rahanpur",
          postOffices: [
            { name: "Rahanpur", postcode: "6340" }
          ]
        },
        {
          name: "Shibganj",
          postOffices: [
            { name: "Shibganj", postcode: "6350" }
          ]
        }
      ]
    },

    // Pabna District
    {
      id: "pabna",
      name: "Pabna",
      areas: [
        {
          name: "Pabna Sadar",
          postOffices: [
            { name: "Pabna Sadar", postcode: "6600" },
            { name: "Pabna TSO", postcode: "6600" }
          ]
        },
        {
          name: "Atgharia",
          postOffices: [
            { name: "Atgharia", postcode: "6610" }
          ]
        },
        {
          name: "Bera",
          postOffices: [
            { name: "Bera", postcode: "6620" }
          ]
        },
        {
          name: "Bhangura",
          postOffices: [
            { name: "Bhangura", postcode: "6630" }
          ]
        },
        {
          name: "Chatmohar",
          postOffices: [
            { name: "Chatmohar", postcode: "6640" }
          ]
        },
        {
          name: "Faridpur",
          postOffices: [
            { name: "Faridpur", postcode: "6650" }
          ]
        },
        {
          name: "Ishwardi",
          postOffices: [
            { name: "Ishwardi", postcode: "6660" }
          ]
        },
        {
          name: "Santhia",
          postOffices: [
            { name: "Santhia", postcode: "6670" }
          ]
        },
        {
          name: "Sujanagar",
          postOffices: [
            { name: "Sujanagar", postcode: "6680" }
          ]
        }
      ]
    },

    // Sirajganj District
    {
      id: "sirajganj",
      name: "Sirajganj",
      areas: [
        {
          name: "Sirajganj Sadar",
          postOffices: [
            { name: "Sirajganj Sadar", postcode: "6700" },
            { name: "Sirajganj TSO", postcode: "6700" }
          ]
        },
        {
          name: "Belkuchi",
          postOffices: [
            { name: "Belkuchi", postcode: "6710" }
          ]
        },
        {
          name: "Chauhali",
          postOffices: [
            { name: "Chauhali", postcode: "6720" }
          ]
        },
        {
          name: "Dhangora",
          postOffices: [
            { name: "Dhangora", postcode: "6730" }
          ]
        },
        {
          name: "Kazipur",
          postOffices: [
            { name: "Kazipur", postcode: "6740" }
          ]
        },
        {
          name: "Kamarkhanda",
          postOffices: [
            { name: "Kamarkhanda", postcode: "6750" }
          ]
        },
        {
          name: "Raiganj",
          postOffices: [
            { name: "Raiganj", postcode: "6760" }
          ]
        },
        {
          name: "Shahjadpur",
          postOffices: [
            { name: "Shahjadpur", postcode: "6770" }
          ]
        },
        {
          name: "Tarash",
          postOffices: [
            { name: "Tarash", postcode: "6780" }
          ]
        },
        {
          name: "Ullahpara",
          postOffices: [
            { name: "Ullahpara", postcode: "6790" }
          ]
        }
      ]
    },

    // ---- KHULNA DIVISION ----

    // Khulna District
    {
      id: "khulna",
      name: "Khulna",
      areas: [
        {
          name: "Khulna Sadar",
          postOffices: [
            { name: "Khulna Sadar", postcode: "9000" },
            { name: "Khulna TSO", postcode: "9000" }
          ]
        },
        {
          name: "Batiaghata",
          postOffices: [
            { name: "Batiaghata", postcode: "9200" }
          ]
        },
        {
          name: "Dacope",
          postOffices: [
            { name: "Dacope", postcode: "9210" }
          ]
        },
        {
          name: "Dumuria",
          postOffices: [
            { name: "Dumuria", postcode: "9220" }
          ]
        },
        {
          name: "Koyra",
          postOffices: [
            { name: "Koyra", postcode: "9230" }
          ]
        },
        {
          name: "Paikgachha",
          postOffices: [
            { name: "Paikgachha", postcode: "9240" }
          ]
        },
        {
          name: "Phultala",
          postOffices: [
            { name: "Phultala", postcode: "9250" }
          ]
        },
        {
          name: "Rupsa",
          postOffices: [
            { name: "Rupsa", postcode: "9260" }
          ]
        },
        {
          name: "Terokhada",
          postOffices: [
            { name: "Terokhada", postcode: "9270" }
          ]
        }
      ]
    },

    // Bagerhat District
    {
      id: "bagerhat",
      name: "Bagerhat",
      areas: [
        {
          name: "Bagerhat Sadar",
          postOffices: [
            { name: "Bagerhat Sadar", postcode: "9300" },
            { name: "Bagerhat TSO", postcode: "9300" }
          ]
        },
        {
          name: "Chitalmari",
          postOffices: [
            { name: "Chitalmari", postcode: "9310" }
          ]
        },
        {
          name: "Fakirhat",
          postOffices: [
            { name: "Fakirhat", postcode: "9320" }
          ]
        },
        {
          name: "Kachua",
          postOffices: [
            { name: "Kachua", postcode: "9330" }
          ]
        },
        {
          name: "Mollahat",
          postOffices: [
            { name: "Mollahat", postcode: "9340" }
          ]
        },
        {
          name: "Mongla",
          postOffices: [
            { name: "Mongla", postcode: "9350" }
          ]
        },
        {
          name: "Morrelganj",
          postOffices: [
            { name: "Morrelganj", postcode: "9360" }
          ]
        },
        {
          name: "Rampal",
          postOffices: [
            { name: "Rampal", postcode: "9370" }
          ]
        },
        {
          name: "Sarankhola",
          postOffices: [
            { name: "Sarankhola", postcode: "9380" }
          ]
        }
      ]
    },

    // Satkhira District
    {
      id: "satkhira",
      name: "Satkhira",
      areas: [
        {
          name: "Satkhira Sadar",
          postOffices: [
            { name: "Satkhira Sadar", postcode: "9400" },
            { name: "Satkhira TSO", postcode: "9400" }
          ]
        },
        {
          name: "Assasuni",
          postOffices: [
            { name: "Assasuni", postcode: "9410" }
          ]
        },
        {
          name: "Debhata",
          postOffices: [
            { name: "Debhata", postcode: "9420" }
          ]
        },
        {
          name: "Kalaroa",
          postOffices: [
            { name: "Kalaroa", postcode: "9430" }
          ]
        },
        {
          name: "Kaliganj",
          postOffices: [
            { name: "Kaliganj", postcode: "9440" }
          ]
        },
        {
          name: "Shyamnagar",
          postOffices: [
            { name: "Shyamnagar", postcode: "9450" }
          ]
        },
        {
          name: "Tala",
          postOffices: [
            { name: "Tala", postcode: "9460" }
          ]
        }
      ]
    },

    // Jessore District
    {
      id: "jessore",
      name: "Jessore",
      areas: [
        {
          name: "Jessore Sadar",
          postOffices: [
            { name: "Jessore Sadar", postcode: "7400" },
            { name: "Jessore TSO", postcode: "7400" }
          ]
        },
        {
          name: "Abhaynagar",
          postOffices: [
            { name: "Abhaynagar", postcode: "7410" }
          ]
        },
        {
          name: "Bagherpara",
          postOffices: [
            { name: "Bagherpara", postcode: "7420" }
          ]
        },
        {
          name: "Chaugachha",
          postOffices: [
            { name: "Chaugachha", postcode: "7430" }
          ]
        },
        {
          name: "Jhikargachha",
          postOffices: [
            { name: "Jhikargachha", postcode: "7440" }
          ]
        },
        {
          name: "Keshabpur",
          postOffices: [
            { name: "Keshabpur", postcode: "7450" }
          ]
        },
        {
          name: "Manirampur",
          postOffices: [
            { name: "Manirampur", postcode: "7460" }
          ]
        },
        {
          name: "Sharsha",
          postOffices: [
            { name: "Sharsha", postcode: "7470" }
          ]
        }
      ]
    },

    // Magura District
    {
      id: "magura",
      name: "Magura",
      areas: [
        {
          name: "Magura Sadar",
          postOffices: [
            { name: "Magura Sadar", postcode: "7600" },
            { name: "Magura TSO", postcode: "7600" }
          ]
        },
        {
          name: "Mohammadpur",
          postOffices: [
            { name: "Mohammadpur", postcode: "7610" }
          ]
        },
        {
          name: "Shalikha",
          postOffices: [
            { name: "Shalikha", postcode: "7620" }
          ]
        },
        {
          name: "Sreepur",
          postOffices: [
            { name: "Sreepur", postcode: "7630" }
          ]
        }
      ]
    },

    // Jhenaidah District
    {
      id: "jhenaidah",
      name: "Jhenaidah",
      areas: [
        {
          name: "Jhenaidah Sadar",
          postOffices: [
            { name: "Jhenaidah Sadar", postcode: "7300" },
            { name: "Jhenaidah TSO", postcode: "7300" }
          ]
        },
        {
          name: "Harinakunda",
          postOffices: [
            { name: "Harinakunda", postcode: "7310" }
          ]
        },
        {
          name: "Kaliganj",
          postOffices: [
            { name: "Kaliganj", postcode: "7320" }
          ]
        },
        {
          name: "Kotchandpur",
          postOffices: [
            { name: "Kotchandpur", postcode: "7330" }
          ]
        },
        {
          name: "Maheshpur",
          postOffices: [
            { name: "Maheshpur", postcode: "7340" }
          ]
        },
        {
          name: "Shailkupa",
          postOffices: [
            { name: "Shailkupa", postcode: "7350" }
          ]
        }
      ]
    },

    // Kushtia District
    {
      id: "kushtia",
      name: "Kushtia",
      areas: [
        {
          name: "Kushtia Sadar",
          postOffices: [
            { name: "Kushtia Sadar", postcode: "7000" },
            { name: "Kushtia TSO", postcode: "7000" }
          ]
        },
        {
          name: "Bheramara",
          postOffices: [
            { name: "Bheramara", postcode: "7010" }
          ]
        },
        {
          name: "Daulatpur",
          postOffices: [
            { name: "Daulatpur", postcode: "7020" }
          ]
        },
        {
          name: "Khoksa",
          postOffices: [
            { name: "Khoksa", postcode: "7030" }
          ]
        },
        {
          name: "Kumarkhali",
          postOffices: [
            { name: "Kumarkhali", postcode: "7040" }
          ]
        },
        {
          name: "Mirpur",
          postOffices: [
            { name: "Mirpur", postcode: "7050" }
          ]
        }
      ]
    },

    // Meherpur District
    {
      id: "meherpur",
      name: "Meherpur",
      areas: [
        {
          name: "Meherpur Sadar",
          postOffices: [
            { name: "Meherpur Sadar", postcode: "7100" },
            { name: "Meherpur TSO", postcode: "7100" }
          ]
        },
        {
          name: "Gangni",
          postOffices: [
            { name: "Gangni", postcode: "7110" }
          ]
        },
        {
          name: "Mujibnagar",
          postOffices: [
            { name: "Mujibnagar", postcode: "7120" }
          ]
        }
      ]
    },

    // Chuadanga District
    {
      id: "chuadanga",
      name: "Chuadanga",
      areas: [
        {
          name: "Chuadanga Sadar",
          postOffices: [
            { name: "Chuadanga Sadar", postcode: "7200" },
            { name: "Chuadanga TSO", postcode: "7200" }
          ]
        },
        {
          name: "Alamdanga",
          postOffices: [
            { name: "Alamdanga", postcode: "7210" }
          ]
        },
        {
          name: "Damurhuda",
          postOffices: [
            { name: "Damurhuda", postcode: "7220" }
          ]
        },
        {
          name: "Jibannagar",
          postOffices: [
            { name: "Jibannagar", postcode: "7230" }
          ]
        }
      ]
    },

    // Narail District
    {
      id: "narail",
      name: "Narail",
      areas: [
        {
          name: "Narail Sadar",
          postOffices: [
            { name: "Narail Sadar", postcode: "7500" },
            { name: "Narail TSO", postcode: "7500" }
          ]
        },
        {
          name: "Kalia",
          postOffices: [
            { name: "Kalia", postcode: "7510" }
          ]
        },
        {
          name: "Lohagara",
          postOffices: [
            { name: "Lohagara", postcode: "7520" }
          ]
        }
      ]
    },

    // ---- BARISHAL DIVISION ----

    // Barishal District
    {
      id: "barishal",
      name: "Barishal",
      areas: [
        {
          name: "Barishal Sadar",
          postOffices: [
            { name: "Barishal Sadar", postcode: "8200" },
            { name: "Barishal TSO", postcode: "8200" }
          ]
        },
        {
          name: "Agailjhara",
          postOffices: [
            { name: "Agailjhara", postcode: "8210" }
          ]
        },
        {
          name: "Babuganj",
          postOffices: [
            { name: "Babuganj", postcode: "8220" }
          ]
        },
        {
          name: "Bakerganj",
          postOffices: [
            { name: "Bakerganj", postcode: "8230" }
          ]
        },
        {
          name: "Banaripara",
          postOffices: [
            { name: "Banaripara", postcode: "8240" }
          ]
        },
        {
          name: "Gaurnadi",
          postOffices: [
            { name: "Gaurnadi", postcode: "8250" }
          ]
        },
        {
          name: "Hizla",
          postOffices: [
            { name: "Hizla", postcode: "8260" }
          ]
        },
        {
          name: "Mehendiganj",
          postOffices: [
            { name: "Mehendiganj", postcode: "8270" }
          ]
        },
        {
          name: "Muladi",
          postOffices: [
            { name: "Muladi", postcode: "8280" }
          ]
        },
        {
          name: "Wazirpur",
          postOffices: [
            { name: "Wazirpur", postcode: "8290" }
          ]
        }
      ]
    },

    // Barguna District
    {
      id: "barguna",
      name: "Barguna",
      areas: [
        {
          name: "Barguna Sadar",
          postOffices: [
            { name: "Barguna Sadar", postcode: "8700" },
            { name: "Barguna TSO", postcode: "8700" }
          ]
        },
        {
          name: "Amtali",
          postOffices: [
            { name: "Amtali", postcode: "8710" }
          ]
        },
        {
          name: "Bamna",
          postOffices: [
            { name: "Bamna", postcode: "8720" }
          ]
        },
        {
          name: "Betagi",
          postOffices: [
            { name: "Betagi", postcode: "8730" }
          ]
        },
        {
          name: "Patharghata",
          postOffices: [
            { name: "Patharghata", postcode: "8740" }
          ]
        },
        {
          name: "Taltali",
          postOffices: [
            { name: "Taltali", postcode: "8750" }
          ]
        }
      ]
    },

    // Bhola District
    {
      id: "bhola",
      name: "Bhola",
      areas: [
        {
          name: "Bhola Sadar",
          postOffices: [
            { name: "Bhola Sadar", postcode: "8300" },
            { name: "Bhola TSO", postcode: "8300" }
          ]
        },
        {
          name: "Borhanuddin",
          postOffices: [
            { name: "Borhanuddin", postcode: "8310" }
          ]
        },
        {
          name: "Char Fasson",
          postOffices: [
            { name: "Char Fasson", postcode: "8320" }
          ]
        },
        {
          name: "Daulatkhan",
          postOffices: [
            { name: "Daulatkhan", postcode: "8330" }
          ]
        },
        {
          name: "Lalmohan",
          postOffices: [
            { name: "Lalmohan", postcode: "8340" }
          ]
        },
        {
          name: "Manpura",
          postOffices: [
            { name: "Manpura", postcode: "8350" }
          ]
        },
        {
          name: "Tazumuddin",
          postOffices: [
            { name: "Tazumuddin", postcode: "8360" }
          ]
        }
      ]
    },

    // Patuakhali District
    {
      id: "patuakhali",
      name: "Patuakhali",
      areas: [
        {
          name: "Patuakhali Sadar",
          postOffices: [
            { name: "Patuakhali Sadar", postcode: "8600" },
            { name: "Patuakhali TSO", postcode: "8600" }
          ]
        },
        {
          name: "Bauphal",
          postOffices: [
            { name: "Bauphal", postcode: "8610" }
          ]
        },
        {
          name: "Dashmina",
          postOffices: [
            { name: "Dashmina", postcode: "8620" }
          ]
        },
        {
          name: "Dumki",
          postOffices: [
            { name: "Dumki", postcode: "8630" }
          ]
        },
        {
          name: "Galachipa",
          postOffices: [
            { name: "Galachipa", postcode: "8640" }
          ]
        },
        {
          name: "Kalapara",
          postOffices: [
            { name: "Kalapara", postcode: "8650" }
          ]
        },
        {
          name: "Mirzaganj",
          postOffices: [
            { name: "Mirzaganj", postcode: "8660" }
          ]
        },
        {
          name: "Rangabali",
          postOffices: [
            { name: "Rangabali", postcode: "8670" }
          ]
        }
      ]
    },

    // Pirojpur District
    {
      id: "pirojpur",
      name: "Pirojpur",
      areas: [
        {
          name: "Pirojpur Sadar",
          postOffices: [
            { name: "Pirojpur Sadar", postcode: "8500" },
            { name: "Pirojpur TSO", postcode: "8500" }
          ]
        },
        {
          name: "Bhandaria",
          postOffices: [
            { name: "Bhandaria", postcode: "8510" }
          ]
        },
        {
          name: "Kawkhali",
          postOffices: [
            { name: "Kawkhali", postcode: "8520" }
          ]
        },
        {
          name: "Mathbaria",
          postOffices: [
            { name: "Mathbaria", postcode: "8530" }
          ]
        },
        {
          name: "Nazirpur",
          postOffices: [
            { name: "Nazirpur", postcode: "8540" }
          ]
        },
        {
          name: "Nesarabad",
          postOffices: [
            { name: "Nesarabad", postcode: "8550" }
          ]
        },
        {
          name: "Zianagar",
          postOffices: [
            { name: "Zianagar", postcode: "8560" }
          ]
        }
      ]
    },

    // Jhalokati District
    {
      id: "jhalokati",
      name: "Jhalokati",
      areas: [
        {
          name: "Jhalokati Sadar",
          postOffices: [
            { name: "Jhalokati Sadar", postcode: "8400" },
            { name: "Jhalokati TSO", postcode: "8400" }
          ]
        },
        {
          name: "Kathalia",
          postOffices: [
            { name: "Kathalia", postcode: "8410" }
          ]
        },
        {
          name: "Nalchity",
          postOffices: [
            { name: "Nalchity", postcode: "8420" }
          ]
        },
        {
          name: "Rajapur",
          postOffices: [
            { name: "Rajapur", postcode: "8430" }
          ]
        }
      ]
    },

    // ---- RANGPUR DIVISION ----

    // Rangpur District
    {
      id: "rangpur",
      name: "Rangpur",
      areas: [
        {
          name: "Rangpur Sadar",
          postOffices: [
            { name: "Rangpur Sadar", postcode: "5400" },
            { name: "Rangpur TSO", postcode: "5400" }
          ]
        },
        {
          name: "Badarganj",
          postOffices: [
            { name: "Badarganj", postcode: "5410" }
          ]
        },
        {
          name: "Gangachara",
          postOffices: [
            { name: "Gangachara", postcode: "5420" }
          ]
        },
        {
          name: "Kaunia",
          postOffices: [
            { name: "Kaunia", postcode: "5430" }
          ]
        },
        {
          name: "Mithapukur",
          postOffices: [
            { name: "Mithapukur", postcode: "5440" }
          ]
        },
        {
          name: "Pirgachha",
          postOffices: [
            { name: "Pirgachha", postcode: "5450" }
          ]
        },
        {
          name: "Pirganj",
          postOffices: [
            { name: "Pirganj", postcode: "5460" }
          ]
        },
        {
          name: "Taraganj",
          postOffices: [
            { name: "Taraganj", postcode: "5470" }
          ]
        }
      ]
    },

    // Dinajpur District
    {
      id: "dinajpur",
      name: "Dinajpur",
      areas: [
        {
          name: "Dinajpur Sadar",
          postOffices: [
            { name: "Dinajpur Sadar", postcode: "5200" },
            { name: "Dinajpur TSO", postcode: "5200" }
          ]
        },
        {
          name: "Birampur",
          postOffices: [
            { name: "Birampur", postcode: "5210" }
          ]
        },
        {
          name: "Birganj",
          postOffices: [
            { name: "Birganj", postcode: "5220" }
          ]
        },
        {
          name: "Bochaganj",
          postOffices: [
            { name: "Bochaganj", postcode: "5230" }
          ]
        },
        {
          name: "Chirirbandar",
          postOffices: [
            { name: "Chirirbandar", postcode: "5240" }
          ]
        },
        {
          name: "Fulbari",
          postOffices: [
            { name: "Fulbari", postcode: "5250" }
          ]
        },
        {
          name: "Ghoraghat",
          postOffices: [
            { name: "Ghoraghat", postcode: "5260" }
          ]
        },
        {
          name: "Hakimpur",
          postOffices: [
            { name: "Hakimpur", postcode: "5270" }
          ]
        },
        {
          name: "Kaharole",
          postOffices: [
            { name: "Kaharole", postcode: "5280" }
          ]
        },
        {
          name: "Khansama",
          postOffices: [
            { name: "Khansama", postcode: "5290" }
          ]
        },
        {
          name: "Nawabganj",
          postOffices: [
            { name: "Nawabganj", postcode: "5291" }
          ]
        },
        {
          name: "Parbatipur",
          postOffices: [
            { name: "Parbatipur", postcode: "5292" }
          ]
        }
      ]
    },

    // Kurigram District
    {
      id: "kurigram",
      name: "Kurigram",
      areas: [
        {
          name: "Kurigram Sadar",
          postOffices: [
            { name: "Kurigram Sadar", postcode: "5600" },
            { name: "Kurigram TSO", postcode: "5600" }
          ]
        },
        {
          name: "Bhurungamari",
          postOffices: [
            { name: "Bhurungamari", postcode: "5610" }
          ]
        },
        {
          name: "Char Rajibpur",
          postOffices: [
            { name: "Char Rajibpur", postcode: "5620" }
          ]
        },
        {
          name: "Chilmari",
          postOffices: [
            { name: "Chilmari", postcode: "5630" }
          ]
        },
        {
          name: "Phulbari",
          postOffices: [
            { name: "Phulbari", postcode: "5640" }
          ]
        },
        {
          name: "Rajarhat",
          postOffices: [
            { name: "Rajarhat", postcode: "5650" }
          ]
        },
        {
          name: "Raumari",
          postOffices: [
            { name: "Raumari", postcode: "5660" }
          ]
        },
        {
          name: "Ulipur",
          postOffices: [
            { name: "Ulipur", postcode: "5670" }
          ]
        }
      ]
    },

    // Gaibandha District
    {
      id: "gaibandha",
      name: "Gaibandha",
      areas: [
        {
          name: "Gaibandha Sadar",
          postOffices: [
            { name: "Gaibandha Sadar", postcode: "5700" },
            { name: "Gaibandha TSO", postcode: "5700" }
          ]
        },
        {
          name: "Fulchhari",
          postOffices: [
            { name: "Fulchhari", postcode: "5710" }
          ]
        },
        {
          name: "Gobindaganj",
          postOffices: [
            { name: "Gobindaganj", postcode: "5720" }
          ]
        },
        {
          name: "Palashbari",
          postOffices: [
            { name: "Palashbari", postcode: "5730" }
          ]
        },
        {
          name: "Sadullapur",
          postOffices: [
            { name: "Sadullapur", postcode: "5740" }
          ]
        },
        {
          name: "Saghata",
          postOffices: [
            { name: "Saghata", postcode: "5750" }
          ]
        },
        {
          name: "Sundarganj",
          postOffices: [
            { name: "Sundarganj", postcode: "5760" }
          ]
        }
      ]
    },

    // Nilphamari District
    {
      id: "nilphamari",
      name: "Nilphamari",
      areas: [
        {
          name: "Nilphamari Sadar",
          postOffices: [
            { name: "Nilphamari Sadar", postcode: "5300" },
            { name: "Nilphamari TSO", postcode: "5300" }
          ]
        },
        {
          name: "Dimla",
          postOffices: [
            { name: "Dimla", postcode: "5310" }
          ]
        },
        {
          name: "Domar",
          postOffices: [
            { name: "Domar", postcode: "5320" }
          ]
        },
        {
          name: "Jaldhaka",
          postOffices: [
            { name: "Jaldhaka", postcode: "5330" }
          ]
        },
        {
          name: "Kishoreganj",
          postOffices: [
            { name: "Kishoreganj", postcode: "5340" }
          ]
        },
        {
          name: "Saidpur",
          postOffices: [
            { name: "Saidpur", postcode: "5350" }
          ]
        }
      ]
    },

    // Panchagarh District
    {
      id: "panchagarh",
      name: "Panchagarh",
      areas: [
        {
          name: "Panchagarh Sadar",
          postOffices: [
            { name: "Panchagarh Sadar", postcode: "5000" },
            { name: "Panchagarh TSO", postcode: "5000" }
          ]
        },
        {
          name: "Atwari",
          postOffices: [
            { name: "Atwari", postcode: "5010" }
          ]
        },
        {
          name: "Boda",
          postOffices: [
            { name: "Boda", postcode: "5020" }
          ]
        },
        {
          name: "Debiganj",
          postOffices: [
            { name: "Debiganj", postcode: "5030" }
          ]
        },
        {
          name: "Tetulia",
          postOffices: [
            { name: "Tetulia", postcode: "5040" }
          ]
        }
      ]
    },

    // Thakurgaon District
    {
      id: "thakurgaon",
      name: "Thakurgaon",
      areas: [
        {
          name: "Thakurgaon Sadar",
          postOffices: [
            { name: "Thakurgaon Sadar", postcode: "5100" },
            { name: "Thakurgaon TSO", postcode: "5100" }
          ]
        },
        {
          name: "Baliadangi",
          postOffices: [
            { name: "Baliadangi", postcode: "5110" }
          ]
        },
        {
          name: "Haripur",
          postOffices: [
            { name: "Haripur", postcode: "5120" }
          ]
        },
        {
          name: "Pirganj",
          postOffices: [
            { name: "Pirganj", postcode: "5130" }
          ]
        },
        {
          name: "Ranisankail",
          postOffices: [
            { name: "Ranisankail", postcode: "5140" }
          ]
        }
      ]
    },

    // Lalmonirhat District
    {
      id: "lalmonirhat",
      name: "Lalmonirhat",
      areas: [
        {
          name: "Lalmonirhat Sadar",
          postOffices: [
            { name: "Lalmonirhat Sadar", postcode: "5500" },
            { name: "Lalmonirhat TSO", postcode: "5500" }
          ]
        },
        {
          name: "Aditmari",
          postOffices: [
            { name: "Aditmari", postcode: "5510" }
          ]
        },
        {
          name: "Hatibandha",
          postOffices: [
            { name: "Hatibandha", postcode: "5520" }
          ]
        },
        {
          name: "Kaliganj",
          postOffices: [
            { name: "Kaliganj", postcode: "5530" }
          ]
        },
        {
          name: "Patgram",
          postOffices: [
            { name: "Patgram", postcode: "5540" }
          ]
        }
      ]
    },

    // ---- MYMENSINGH DIVISION ----

    // Mymensingh District
    {
      id: "mymensingh",
      name: "Mymensingh",
      areas: [
        {
          name: "Mymensingh Sadar",
          postOffices: [
            { name: "Mymensingh Sadar", postcode: "2200" },
            { name: "Mymensingh TSO", postcode: "2200" }
          ]
        },
        {
          name: "Bhaluka",
          postOffices: [
            { name: "Bhaluka", postcode: "2210" }
          ]
        },
        {
          name: "Dhobaura",
          postOffices: [
            { name: "Dhobaura", postcode: "2220" }
          ]
        },
        {
          name: "Fulbaria",
          postOffices: [
            { name: "Fulbaria", postcode: "2230" }
          ]
        },
        {
          name: "Gaffargaon",
          postOffices: [
            { name: "Gaffargaon", postcode: "2240" }
          ]
        },
        {
          name: "Gauripur",
          postOffices: [
            { name: "Gauripur", postcode: "2250" }
          ]
        },
        {
          name: "Haluaghat",
          postOffices: [
            { name: "Haluaghat", postcode: "2260" }
          ]
        },
        {
          name: "Ishwarganj",
          postOffices: [
            { name: "Ishwarganj", postcode: "2270" }
          ]
        },
        {
          name: "Muktagachha",
          postOffices: [
            { name: "Muktagachha", postcode: "2280" }
          ]
        },
        {
          name: "Nandail",
          postOffices: [
            { name: "Nandail", postcode: "2290" }
          ]
        },
        {
          name: "Phulpur",
          postOffices: [
            { name: "Phulpur", postcode: "2291" }
          ]
        },
        {
          name: "Trishal",
          postOffices: [
            { name: "Trishal", postcode: "2292" }
          ]
        }
      ]
    },

    // Jamalpur District
    {
      id: "jamalpur",
      name: "Jamalpur",
      areas: [
        {
          name: "Jamalpur Sadar",
          postOffices: [
            { name: "Jamalpur Sadar", postcode: "2000" },
            { name: "Jamalpur TSO", postcode: "2000" }
          ]
        },
        {
          name: "Bakshiganj",
          postOffices: [
            { name: "Bakshiganj", postcode: "2010" }
          ]
        },
        {
          name: "Dewanganj",
          postOffices: [
            { name: "Dewanganj", postcode: "2020" }
          ]
        },
        {
          name: "Islampur",
          postOffices: [
            { name: "Islampur", postcode: "2030" }
          ]
        },
        {
          name: "Madarganj",
          postOffices: [
            { name: "Madarganj", postcode: "2040" }
          ]
        },
        {
          name: "Melandaha",
          postOffices: [
            { name: "Melandaha", postcode: "2050" }
          ]
        },
        {
          name: "Sarishabari",
          postOffices: [
            { name: "Sarishabari", postcode: "2060" }
          ]
        }
      ]
    },

    // Netrokona District
    {
      id: "netrokona",
      name: "Netrokona",
      areas: [
        {
          name: "Netrokona Sadar",
          postOffices: [
            { name: "Netrokona Sadar", postcode: "2400" },
            { name: "Netrokona TSO", postcode: "2400" }
          ]
        },
        {
          name: "Atpara",
          postOffices: [
            { name: "Atpara", postcode: "2410" }
          ]
        },
        {
          name: "Barhatta",
          postOffices: [
            { name: "Barhatta", postcode: "2420" }
          ]
        },
        {
          name: "Durgapur",
          postOffices: [
            { name: "Durgapur", postcode: "2430" }
          ]
        },
        {
          name: "Khaliajuri",
          postOffices: [
            { name: "Khaliajuri", postcode: "2440" }
          ]
        },
        {
          name: "Kalmakanda",
          postOffices: [
            { name: "Kalmakanda", postcode: "2450" }
          ]
        },
        {
          name: "Kendua",
          postOffices: [
            { name: "Kendua", postcode: "2460" }
          ]
        },
        {
          name: "Madan",
          postOffices: [
            { name: "Madan", postcode: "2470" }
          ]
        },
        {
          name: "Mohanganj",
          postOffices: [
            { name: "Mohanganj", postcode: "2480" }
          ]
        },
        {
          name: "Purbadhala",
          postOffices: [
            { name: "Purbadhala", postcode: "2490" }
          ]
        }
      ]
    },

    // Sherpur District
    {
      id: "sherpur",
      name: "Sherpur",
      areas: [
        {
          name: "Sherpur Sadar",
          postOffices: [
            { name: "Sherpur Sadar", postcode: "2100" },
            { name: "Sherpur TSO", postcode: "2100" }
          ]
        },
        {
          name: "Jhenaigati",
          postOffices: [
            { name: "Jhenaigati", postcode: "2110" }
          ]
        },
        {
          name: "Nakla",
          postOffices: [
            { name: "Nakla", postcode: "2120" }
          ]
        },
        {
          name: "Nalitabari",
          postOffices: [
            { name: "Nalitabari", postcode: "2130" }
          ]
        },
        {
          name: "Sreebardi",
          postOffices: [
            { name: "Sreebardi", postcode: "2140" }
          ]
        }
      ]
    }
  ];

// ------------------------- SIMPLE DISTRICTS (back-compat: names only) -------------------------
export const BANGLADESH_DISTRICTS: District[] = [
  // Dhaka Division
  { id: "dhaka", name: "Dhaka", areas: [
    "Dhanmondi","Gulshan","Banani","Uttara","Mirpur","Mohammadpur","Tejgaon","Demra","Dhaka Cantonment","Dohar (Joypara)","Dhamrai","Keraniganj","Nawabganj","Savar"
  ]},
  { id: "narayanganj", name: "Narayanganj", areas: [
    "Narayanganj Sadar / City","Bandar","Siddhirganj","Araihazar","Sonargaon / Baidyer Bazar","Rupganj"
  ]},
  { id: "gazipur", name: "Gazipur", areas: [
    "Gazipur Sadar / City","Tongi","Kaliakoir","Sreepur","Kaliganj (Gazipur)","Kapasia"
  ]},
  { id: "tangail", name: "Tangail", areas: [
    "Tangail Sadar","Basail","Delduar","Dighor","Ghatail","Gopalpur","Kalihati","Madhupur","Mirzapur","Nagarpur","Sakhipur"
  ]},
  { id: "narsingdi", name: "Narsingdi", areas: [
    "Narsingdi Sadar","Belabo","Monohardi","Palash","Raipura","Shibpur"
  ]},
  { id: "munshiganj", name: "Munshiganj", areas: [
    "Munshiganj Sadar","Gazaria","Lohajang","Sirajdikhan","Sreenagar","Tongibari"
  ]},
  { id: "kishoreganj", name: "Kishoreganj", areas: [
    "Kishoreganj Sadar","Austagram","Bajitpur","Bhairab","Hossainpur","Itna","Karimganj","Katiadi","Kuliarchar","Mithamain","Nikli","Pakundia","Tarail"
  ]},
  { id: "manikganj", name: "Manikganj", areas: [
    "Manikganj Sadar","Daulatpur","Ghior","Harirampur","Saturia","Shibalaya","Singair"
  ]},
  { id: "faridpur", name: "Faridpur", areas: [
    "Faridpur Sadar","Alfadanga","Bhanga","Boalmari","Charbhadrasan","Madhukhali","Nagarkanda","Sadarpur","Saltha"
  ]},
  { id: "rajbari", name: "Rajbari", areas: [
    "Rajbari Sadar","Baliakandi","Goalandaghat","Pangsha"
  ]},
  { id: "madaripur", name: "Madaripur", areas: [
    "Madaripur Sadar","Kalkini","Rajoir","Shibchar"
  ]},
  { id: "gopalganj", name: "Gopalganj", areas: [
    "Gopalganj Sadar","Kashiani","Kotalipara","Muksudpur","Tungipara"
  ]},
  { id: "shariatpur", name: "Shariatpur", areas: [
    "Shariatpur Sadar","Bhedarganj","Damudya","Gosairhat","Naria","Zanjira"
  ]},

  // Chittagong Division
  { id: "chattogram", name: "Chattogram", areas: [
    "Agrabad / Double Mooring","Kotwali / Anderkilla","Pahartali","Chawkbazar","Halishahar","Patenga","Anwara","Banshkhali","Boalkhali","Chandanaish","Fatikchhari","Hathazari","Lohagara","Mirsharai","Patiya","Rangunia","Raozan","Sandwip","Satkania","Sitakunda"
  ]},
  { id: "cumilla", name: "Cumilla", areas: [
    "Cumilla Sadar / City","Daudkandi","Chandina","Burichong","Laksam","Barura","Brahmanpara","Chauddagram","Homna","Laksham","Meghna","Monoharganj","Muradnagar","Nangalkot","Titas"
  ]},
  { id: "brahmanbaria", name: "Brahmanbaria", areas: [
    "Brahmanbaria Sadar","Akhaura","Bancharampur","Kasba","Nabinagar","Nasirnagar","Sarail"
  ]},
  { id: "chandpur", name: "Chandpur", areas: [
    "Chandpur Sadar","Faridganj","Haimchar","Hajiganj","Kachua","Matlab Dakshin","Matlab Uttar","Shahrasti"
  ]},
  { id: "lakshmipur", name: "Lakshmipur", areas: [
    "Lakshmipur Sadar","Kamalnagar","Raipur","Ramganj","Ramgati"
  ]},
  { id: "noakhali", name: "Noakhali", areas: [
    "Noakhali Sadar","Begumganj","Chatkhil","Companiganj","Hatiya","Kabirhat","Senbagh","Sonaimuri","Subarnachar"
  ]},
  { id: "feni", name: "Feni", areas: [
    "Feni Sadar","Chhagalnaiya","Daganbhuiyan","Parshuram","Sonagazi"
  ]},
  { id: "coxs-bazar", name: "Cox's Bazar", areas: [
    "Cox's Bazar Sadar","Chakaria","Kutubdia","Maheshkhali","Pekua","Ramu","Teknaf","Ukhia"
  ]},
  { id: "rangamati", name: "Rangamati", areas: [
    "Rangamati Sadar","Bagaichhari","Barkal","Belaichhari","Juraichhari","Kaptai","Kawkhali","Langadu","Naniarchar","Rajasthali"
  ]},
  { id: "bandarban", name: "Bandarban", areas: [
    "Bandarban Sadar","Alikadam","Lama","Naikhongchhari","Rowangchhari","Ruma","Thanchi"
  ]},
  { id: "khagrachhari", name: "Khagrachhari", areas: [
    "Khagrachhari Sadar","Dighinala","Lakshmichhari","Mahalchhari","Manikchhari","Matiranga","Panchhari","Ramgarh"
  ]},

  // Sylhet Division
  { id: "sylhet", name: "Sylhet", areas: [
    "Sylhet Sadar / City","Beanibazar","Bishwanath","Jaintiapur / Gowainghat","Balaganj","Biswanath","Companiganj","Dakshin Surma","Fenchuganj","Golapganj","Gowainghat","Jaintiapur","Kanaighat","Osmani Nagar","Uttar Surma"
  ]},
  { id: "moulvibazar", name: "Moulvibazar", areas: [
    "Moulvibazar Sadar","Barlekha","Juri","Kamalganj","Kulaura","Rajnagar","Sreemangal"
  ]},
  { id: "habiganj", name: "Habiganj", areas: [
    "Habiganj Sadar","Ajmiriganj","Bahubal","Baniyachong","Chunarughat","Lakhai","Madhabpur","Nabiganj"
  ]},
  { id: "sunamganj", name: "Sunamganj", areas: [
    "Sunamganj Sadar","Bishwamvarpur","Chhatak","Derai","Dharampasha","Dowarabazar","Jagannathpur","Jamalganj","Sullah","Tahirpur"
  ]},

  // Rajshahi Division
  { id: "rajshahi", name: "Rajshahi", areas: [
    "Rajshahi Sadar","Bagha","Bagmara","Charghat","Durgapur","Godagari","Mohanpur","Paba","Puthia","Tanore"
  ]},
  { id: "bogura", name: "Bogura", areas: [
    "Bogura Sadar","Adamdighi","Dhunat","Gabtali","Kahaloo","Nandigram","Sariakandi","Shabganj","Sherpur","Shibganj","Sonatola"
  ]},
  { id: "joypurhat", name: "Joypurhat", areas: [
    "Joypurhat Sadar","Akkelpur","Kalai","Khetlal","Panchbibi"
  ]},
  { id: "naogaon", name: "Naogaon", areas: [
    "Naogaon Sadar","Atrai","Badalgachhi","Dhamoirhat","Manda","Mohadevpur","Niamatpur","Patnitala","Porsha","Raninagar","Sapahar"
  ]},
  { id: "natore", name: "Natore", areas: [
    "Natore Sadar","Bagatipara","Baraigram","Gurudaspur","Lalpur","Singra"
  ]},
  { id: "chapainawabganj", name: "Chapainawabganj", areas: [
    "Chapainawabganj Sadar","Bholahat","Gomastapur","Nachole","Rahanpur","Shibganj"
  ]},
  { id: "pabna", name: "Pabna", areas: [
    "Pabna Sadar","Atgharia","Bera","Bhangura","Chatmohar","Faridpur","Ishwardi","Santhia","Sujanagar"
  ]},
  { id: "sirajganj", name: "Sirajganj", areas: [
    "Sirajganj Sadar","Belkuchi","Chauhali","Dhangora","Kazipur","Kamarkhanda","Raiganj","Shahjadpur","Tarash","Ullahpara"
  ]},

  // Khulna Division
  { id: "khulna", name: "Khulna", areas: [
    "Khulna Sadar","Batiaghata","Dacope","Dumuria","Koyra","Paikgachha","Phultala","Rupsa","Terokhada"
  ]},
  { id: "bagerhat", name: "Bagerhat", areas: [
    "Bagerhat Sadar","Chitalmari","Fakirhat","Kachua","Mollahat","Mongla","Morrelganj","Rampal","Sarankhola"
  ]},
  { id: "satkhira", name: "Satkhira", areas: [
    "Satkhira Sadar","Assasuni","Debhata","Kalaroa","Kaliganj","Shyamnagar","Tala"
  ]},
  { id: "jessore", name: "Jessore", areas: [
    "Jessore Sadar","Abhaynagar","Bagherpara","Chaugachha","Jhikargachha","Keshabpur","Manirampur","Sharsha"
  ]},
  { id: "magura", name: "Magura", areas: [
    "Magura Sadar","Mohammadpur","Shalikha","Sreepur"
  ]},
  { id: "jhenaidah", name: "Jhenaidah", areas: [
    "Jhenaidah Sadar","Harinakunda","Kaliganj","Kotchandpur","Maheshpur","Shailkupa"
  ]},
  { id: "kushtia", name: "Kushtia", areas: [
    "Kushtia Sadar","Bheramara","Daulatpur","Khoksa","Kumarkhali","Mirpur"
  ]},
  { id: "meherpur", name: "Meherpur", areas: [
    "Meherpur Sadar","Gangni","Mujibnagar"
  ]},
  { id: "chuadanga", name: "Chuadanga", areas: [
    "Chuadanga Sadar","Alamdanga","Damurhuda","Jibannagar"
  ]},
  { id: "narail", name: "Narail", areas: [
    "Narail Sadar","Kalia","Lohagara"
  ]},

  // Barishal Division
  { id: "barishal", name: "Barishal", areas: [
    "Barishal Sadar","Agailjhara","Babuganj","Bakerganj","Banaripara","Gaurnadi","Hizla","Mehendiganj","Muladi","Wazirpur"
  ]},
  { id: "barguna", name: "Barguna", areas: [
    "Barguna Sadar","Amtali","Bamna","Betagi","Patharghata","Taltali"
  ]},
  { id: "bhola", name: "Bhola", areas: [
    "Bhola Sadar","Borhanuddin","Char Fasson","Daulatkhan","Lalmohan","Manpura","Tazumuddin"
  ]},
  { id: "patuakhali", name: "Patuakhali", areas: [
    "Patuakhali Sadar","Bauphal","Dashmina","Dumki","Galachipa","Kalapara","Mirzaganj","Rangabali"
  ]},
  { id: "pirojpur", name: "Pirojpur", areas: [
    "Pirojpur Sadar","Bhandaria","Kawkhali","Mathbaria","Nazirpur","Nesarabad","Zianagar"
  ]},
  { id: "jhalokati", name: "Jhalokati", areas: [
    "Jhalokati Sadar","Kathalia","Nalchity","Rajapur"
  ]},

  // Rangpur Division
  { id: "rangpur", name: "Rangpur", areas: [
    "Rangpur Sadar","Badarganj","Gangachara","Kaunia","Mithapukur","Pirgachha","Pirganj","Taraganj"
  ]},
  { id: "dinajpur", name: "Dinajpur", areas: [
    "Dinajpur Sadar","Birampur","Birganj","Bochaganj","Chirirbandar","Fulbari","Ghoraghat","Hakimpur","Kaharole","Khansama","Nawabganj","Parbatipur"
  ]},
  { id: "kurigram", name: "Kurigram", areas: [
    "Kurigram Sadar","Bhurungamari","Char Rajibpur","Chilmari","Phulbari","Rajarhat","Raumari","Ulipur"
  ]},
  { id: "gaibandha", name: "Gaibandha", areas: [
    "Gaibandha Sadar","Fulchhari","Gobindaganj","Palashbari","Sadullapur","Saghata","Sundarganj"
  ]},
  { id: "nilphamari", name: "Nilphamari", areas: [
    "Nilphamari Sadar","Dimla","Domar","Jaldhaka","Kishoreganj","Saidpur"
  ]},
  { id: "panchagarh", name: "Panchagarh", areas: [
    "Panchagarh Sadar","Atwari","Boda","Debiganj","Tetulia"
  ]},
  { id: "thakurgaon", name: "Thakurgaon", areas: [
    "Thakurgaon Sadar","Baliadangi","Haripur","Pirganj","Ranisankail"
  ]},
  { id: "lalmonirhat", name: "Lalmonirhat", areas: [
    "Lalmonirhat Sadar","Aditmari","Hatibandha","Kaliganj","Patgram"
  ]},

  // Mymensingh Division
  { id: "mymensingh", name: "Mymensingh", areas: [
    "Mymensingh Sadar","Bhaluka","Dhobaura","Fulbaria","Gaffargaon","Gauripur","Haluaghat","Ishwarganj","Muktagachha","Nandail","Phulpur","Trishal"
  ]},
  { id: "jamalpur", name: "Jamalpur", areas: [
    "Jamalpur Sadar","Bakshiganj","Dewanganj","Islampur","Madarganj","Melandaha","Sarishabari"
  ]},
  { id: "netrokona", name: "Netrokona", areas: [
    "Netrokona Sadar","Atpara","Barhatta","Durgapur","Khaliajuri","Kalmakanda","Kendua","Madan","Mohanganj","Purbadhala"
  ]},
  { id: "sherpur", name: "Sherpur", areas: [
    "Sherpur Sadar","Jhenaigati","Nakla","Nalitabari","Sreebardi"
  ]}
];

// ------------------------- HELPERS -------------------------
export function getAreasByDistrict(districtNameOrId: string): string[] {
  const district = BANGLADESH_DISTRICTS.find(
    d => d.name.toLowerCase() === districtNameOrId.toLowerCase() || d.id === districtNameOrId
  );
  return district ? district.areas : [];
}

export function getPostOfficesByArea(districtId: string, areaName: string): PostOffice[] {
  const district = BANGLADESH_DISTRICTS_WITH_POST_OFFICES.find(d => d.id === districtId);
  if (!district) return [];
  const area = district.areas.find(a => a.name.toLowerCase() === areaName.toLowerCase());
  return area ? area.postOffices : [];
}

export function findPostcode(districtId: string, areaQuery: string, officeQuery?: string): PostOffice[] {
  const district = BANGLADESH_DISTRICTS_WITH_POST_OFFICES.find(d => d.id === districtId);
  if (!district) return [];
  const q = (s: string) => s.toLowerCase().includes(areaQuery.toLowerCase());
  const oq = (s: string) => !officeQuery || s.toLowerCase().includes(officeQuery.toLowerCase());
  const matches: PostOffice[] = [];
  for (const area of district.areas) {
    if (q(area.name)) {
      matches.push(...area.postOffices.filter(po => oq(po.name)));
    }
  }
  return matches;
}

export const ALL_DISTRICTS = [
  // Dhaka Division (13 districts)
  "Dhaka", "Narayanganj", "Gazipur", "Tangail", "Narsingdi", "Munshiganj", "Kishoreganj", 
  "Manikganj", "Faridpur", "Rajbari", "Madaripur", "Gopalganj", "Shariatpur",
  
  // Chittagong Division (11 districts)
  "Chattogram", "Cumilla", "Brahmanbaria", "Chandpur", "Lakshmipur", "Noakhali", "Feni", 
  "Cox's Bazar", "Rangamati", "Bandarban", "Khagrachhari",
  
  // Sylhet Division (4 districts)
  "Sylhet", "Moulvibazar", "Habiganj", "Sunamganj",
  
  // Rajshahi Division (8 districts)
  "Rajshahi", "Bogura", "Joypurhat", "Naogaon", "Natore", "Chapainawabganj", "Pabna", "Sirajganj",
  
  // Khulna Division (10 districts)
  "Khulna", "Bagerhat", "Satkhira", "Jessore", "Magura", "Jhenaidah", "Kushtia", "Meherpur", 
  "Chuadanga", "Narail",
  
  // Barishal Division (6 districts)
  "Barishal", "Barguna", "Bhola", "Patuakhali", "Pirojpur", "Jhalokati",
  
  // Rangpur Division (8 districts)
  "Rangpur", "Dinajpur", "Kurigram", "Gaibandha", "Nilphamari", "Panchagarh", "Thakurgaon", "Lalmonirhat",
  
  // Mymensingh Division (4 districts)
  "Mymensingh", "Jamalpur", "Netrokona", "Sherpur"
];
  