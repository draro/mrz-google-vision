const express = require("express");
const app = express();
const port = process.env.port || 5000;
const vision = require("@google-cloud/vision");
// const CodiceFiscale = require("./codiceFiscale");
const client = new vision.ImageAnnotatorClient({
  keyFilename: "nolo-boss-395211-d21d7b2a3656.json",
});
const fs = require("fs");

const parse = require("mrz").parse;

const quickstart = async (file, type) => {
  try {
    if (type === "Passport") {
      //Google Cloud Vision Text Annotator (OCR)
      //Extracting the mrz and preparing it for decoding
      const [result] = await client.textDetection(file);
      const texts = result.textAnnotations;
      let mainResult = texts[0].description;
      let mrzStartPosition = mainResult.indexOf("P<");
      let mrzText = mainResult.slice(mrzStartPosition);
      let textss = mrzText.replace(/\s/g, "");
      let line1 = textss.substring(0, 44);
      let line2 = textss.substring(44, 88);
      let mrzToDecode = `${line1}\n${line2}`;
      //MRZ Parser from https://www.npmjs.com/package/mrz
      let passportDetails = parse(mrzToDecode);
      const regex = /(?<year>[0-9]{2})(?<month>[0-9]{2})(?<day>[0-9]{2})/gm;
      const birth = regex.exec(passportDetails.fields.birthDate).groups;
      const year =
        birth.year < new Date().getFullYear() - 100
          ? parseInt(`19${birth.year}`)
          : parseInt(`20${birth.year}`);
      passportDetails.fields.birthDate = `${year}-${birth.month}-${birth.day}`;
      const regex2 = /(?<year>[0-9]{2})(?<month>[0-9]{2})(?<day>[0-9]{2})/gm;
      const expiration = regex2.exec(
        passportDetails.fields.expirationDate
      ).groups;
      const yearExp = parseInt(`20${expiration.year}`);
      passportDetails.fields[
        "expirationDate"
      ] = `${yearExp}-${expiration.month}-${expiration.day}`;
      // console.log(year)
      return passportDetails.fields;
    }
    if (type === 'id'){
      const [result] = await client.textDetection(file);
      const texts = result.textAnnotations;
      // console.log(texts)
      let mainResult = texts[0].description;
      let comuniData = JSON.parse(fs.readFileSync("comuni.json"));
      let comuni_list = []
      comuniData.map(item => {
        comuni_list.push(item.nome)
      })
      console.log(mainResult.indexOf("'"))
      let comunePosition =  mainResult.slice("'").split('\n')
      console.log(comunePosition)
      comunePosition = comunePosition.slice(0,200)
      console.log(comunePosition)
      let codiceFiscale
      for (let i=0;i< comunePosition.length;i++){
        if (comunePosition[i] === 'CODICE FISCALE'){
          console.log(i)
          codiceFiscale = i + 2
        }
      }
      if (codiceFiscale){
        codiceFiscale = comunePosition[codiceFiscale]
      }
      let comune
      for (let i=0;i < comuni_list.length;i++){
        if (comunePosition.indexOf(comuni_list[i].toUpperCase().replace(' ','')) !== -1){
            comune = comuni_list[i]
        }
      }
      let mrzStartPosition = mainResult.indexOf("C<");
      
      let mrzText = mainResult.slice(mrzStartPosition);
      let textss = mrzText.replace(/\s/g, "");
      console.log(textss)
  
      let line1 = textss.substring(0, 30);
      console.log(line1)
      let line2 = textss.substring(30, 60);
      console.log(line2)
      let line3 = textss.substring(60, 90);
      console.log(line3)
      let mrzToDecode = `${line1}\n${line2}\n${line3}`;
  
      //MRZ Parser from https://www.npmjs.com/package/mrz
      let id = parse(mrzToDecode);
      
      const regex = /(?<year>[0-9]{2})(?<month>[0-9]{2})(?<day>[0-9]{2})/gm;
      const birth = regex.exec(id.fields.birthDate).groups;
      const year =
        birth.year < new Date().getFullYear() - 100
          ? parseInt(`19${birth.year}`)
          : parseInt(`20${birth.year}`);
      id.fields.birthDate = `${year}-${birth.month}-${birth.day}`;
      const regex2 = /(?<year>[0-9]{2})(?<month>[0-9]{2})(?<day>[0-9]{2})/gm;
      const expiration = regex2.exec(
        id.fields.expirationDate
      ).groups;
      const yearExp = parseInt(`20${expiration.year}`);
      id.fields[
        "expirationDate"
      ] = `${yearExp}-${expiration.month}-${expiration.day}`;
      // id.fields.municipality = comune
      id.fields.codiceFiscale = codiceFiscale
      return id.fields;
    }
  } catch (error) {
    return error
  }
 
};
const start = Date.now();
let dati
try {
  const data = async () => {
    dati = await quickstart('./samples/Passport.png','Passport');
    console.log(dati) 
  }
  data()
  
} catch (e) {
  console.error(e);
}
app.listen(port, "127.0.0.1", () =>
  console.log(`Server Running Okay On ${port}`)
);
