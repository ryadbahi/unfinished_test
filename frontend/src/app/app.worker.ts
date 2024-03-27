import * as XLSX from 'xlsx';
import { listing } from './pages/validlist/validlist.component';
import { dptsin } from './pages/verifsin/verifsin.component';

addEventListener('message', ({ data }) => {
  if (!data || !data.file) {
    console.error('Invalid data received in web worker:', data);
    return;
  }

  const file = data.file;
  const method = data.method;

  switch (method) {
    case 'readExcel':
      readExcel(file);
      break;
    case 'readDptSinExcel':
      readDptSinExcel(file);
      break;
    default:
      console.error('Invalid method:', method);
      break;
  }
});
// Function to read Excel file
function readExcel(file: File) {
  const fileReader = new FileReader();

  fileReader.onload = (e) => {
    try {
      var workBook = XLSX.read(fileReader.result, {
        type: 'binary',
        raw: true,
      });

      // Process the data and post it back to the main thread
      var firstSheetName = workBook.SheetNames[0];
      var sheet = workBook.Sheets[firstSheetName];
      var rearrangedData: listing[] = processSheet(sheet);

      postMessage({ type: 'success', data: rearrangedData });
    } catch (error) {
      // Handle errors and post them back to the main thread
      postMessage({ type: 'error', error: error });
    }
  };

  fileReader.readAsBinaryString(file);
}

function readDptSinExcel(file: File) {
  const fileReader = new FileReader();

  fileReader.onload = (e) => {
    try {
      var workBook = XLSX.read(fileReader.result, {
        type: 'binary',
        raw: true,
      });

      // Process the data and post it back to the main thread
      var firstSheetName = workBook.SheetNames[0];
      var sheet = workBook.Sheets[firstSheetName];
      var dptData: dptsin[] = processDptSinSheet(sheet);

      postMessage({ type: 'success', data: dptData });
    } catch (error) {
      // Handle errors and post them back to the main thread
      postMessage({ type: 'error', error: error });
    }
  };

  fileReader.readAsBinaryString(file);
}

// Function to process the sheet
function processSheet(sheet: XLSX.WorkSheet): listing[] {
  let adherentCounter = 1;
  let familyCounter = 0;
  let currentAdherentId = '';
  let rearrangedData: listing[] = [];
  let tempData: listing[] = []; // Temporary array to hold the data

  const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;

  if (sheet['!ref']) {
    let range = XLSX.utils.decode_range(sheet['!ref']);
    for (let i = range.s.r + 1; i <= range.e.r; i++) {
      let serial = sheet[XLSX.utils.encode_cell({ r: i, c: 0 })]?.v;
      let lienBnf = sheet[XLSX.utils.encode_cell({ r: i, c: 1 })]?.v;
      let num = sheet[XLSX.utils.encode_cell({ r: i, c: 2 })]?.v || '';
      let nom = sheet[XLSX.utils.encode_cell({ r: i, c: 3 })]?.v;
      let prenom = sheet[XLSX.utils.encode_cell({ r: i, c: 4 })]?.v;
      let dateDeNaissance = sheet[XLSX.utils.encode_cell({ r: i, c: 5 })]?.v;

      if (!serial || !lienBnf || !num || !nom || !prenom || !dateDeNaissance) {
        throw new Error(
          `Des données obligatoires sont manquantes sur la ligne ${i + 1}`
        );
      }

      if (typeof dateDeNaissance === 'number') {
        const msSinceEpoch = (dateDeNaissance - 25569) * 86400 * 1000;
        const date = new Date(msSinceEpoch);
        if (!isNaN(date.getTime())) {
          dateDeNaissance = date;
        } else {
          throw new Error(`Date invalide sur la ligne ${i + 1}`);
        }
      } else if (typeof dateDeNaissance === 'string') {
        if (!dateRegex.test(dateDeNaissance)) {
          throw new Error(
            `Format de la date invalide (JJ/MM/AAAA) sur la ligne ${i + 1}`
          );
        }
        const dateMatch = dateDeNaissance.match(dateRegex);
        if (dateMatch) {
          dateDeNaissance = new Date(
            `${dateMatch[2]}/${dateMatch[1]}/${dateMatch[3]}`
          );
        } else {
          throw new Error(
            `Format de la date invalide (JJ/MM/AAAA) la ligne ${i + 1}`
          );
        }
      } else {
        throw new Error(`Date invalide la ligne ${i + 1}`);
      }

      let rib = sheet[XLSX.utils.encode_cell({ r: i, c: 9 })]?.v;
      let categorie = sheet[XLSX.utils.encode_cell({ r: i, c: 10 })]?.v;
      let email = sheet[XLSX.utils.encode_cell({ r: i, c: 11 })]?.v || '';
      const item: listing = {
        fam_adh: [],
        serial,
        lienBnf,
        num,
        nom,
        prenom,
        dateDeNaissance,
        rib,
        categorie,
        email,
      };
      tempData.push(item); // Add the item to the temporary array
    }

    // Sort the temporary array so that 'ass' comes before 'Conjoint' and 'Enfant' for each serial
    tempData.sort((a, b) => {
      if (typeof a.lienBnf === 'undefined') {
        console.log("Undefined lienBnf in 'a':", a);
      } else if (typeof b.lienBnf === 'undefined') {
        console.log("Undefined lienBnf in 'b':", b);
      }

      if (a.nom !== b.num) {
        return a.num < b.num ? -1 : 1;
      } else {
        return a.lienBnf && a.lienBnf.toLowerCase().includes('ass') ? -1 : 1;
      }
    });

    // Process the sorted array
    tempData.forEach((item) => {
      if (
        item.lienBnf &&
        typeof item.lienBnf === 'string' &&
        item.lienBnf.trim().toLowerCase().includes('ass')
      ) {
        item.id = adherentCounter.toString();
        currentAdherentId = item.id;
        adherentCounter++;
        familyCounter = 0;
        rearrangedData.push(item);
      } else if (item.lienBnf && typeof item.lienBnf === 'string') {
        item.id =
          currentAdherentId +
          String.fromCharCode('a'.charCodeAt(0) + familyCounter);
        familyCounter++;
        const adherent = rearrangedData.find(
          (adherentItem) => adherentItem.num === item.num
        );
        if (adherent) {
          adherent.fam_adh = adherent.fam_adh || [];
          adherent.fam_adh.push(item);
          adherent.fam_adh.sort((a, b) => (a.lienBnf === 'Conjoint' ? -1 : 1));
        }
      }
    });
  }

  return rearrangedData;
}

function processDptSinSheet(sheet: XLSX.WorkSheet): dptsin[] {
  let sinId = 0;
  let dptData: dptsin[] = [];
  if (sheet['!ref']) {
    let range = XLSX.utils.decode_range(sheet['!ref']);
    for (let i = range.s.r + 1; i <= range.e.r - 1; i++) {
      let id = sinId++;
      let indx = sheet[XLSX.utils.encode_cell({ r: i, c: 0 })]?.v;
      let assu_nom = sheet[XLSX.utils.encode_cell({ r: i, c: 1 })]?.v;
      let assu_prenom = sheet[XLSX.utils.encode_cell({ r: i, c: 2 })]?.v || '';
      let lien_benef = sheet[XLSX.utils.encode_cell({ r: i, c: 3 })]?.v;
      let benef_prenom = sheet[XLSX.utils.encode_cell({ r: i, c: 4 })]?.v;
      let date_sin = sheet[XLSX.utils.encode_cell({ r: i, c: 5 })]?.v;
      let acte = sheet[XLSX.utils.encode_cell({ r: i, c: 6 })]?.v;
      let frais = sheet[XLSX.utils.encode_cell({ r: i, c: 7 })]?.v;
      let rbt = sheet[XLSX.utils.encode_cell({ r: i, c: 8 })]?.v || '';
      let rib = sheet[XLSX.utils.encode_cell({ r: i, c: 9 })]?.v || '';
      let obs = sheet[XLSX.utils.encode_cell({ r: i, c: 10 })]?.v || '';
      let status = sheet[XLSX.utils.encode_cell({ r: i, c: 11 })]?.v || '';

      const item: dptsin = {
        id,
        indx,
        assu_nom,
        assu_prenom,
        lien_benef,
        benef_prenom,
        date_sin,
        acte,
        frais,
        rbt,
        rib,
        obs,
        status,
      };
      dptData.push(item);
    }
  }
  return dptData;
}
