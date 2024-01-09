const express = require('express');
const app = express();
const port = process.env.port || 5000;
const vision = require('@google-cloud/vision');
const client = new vision.ImageAnnotatorClient(
  {
    keyFilename: 'API.json'
  }
);
const parse = require('mrz').parse;


  const quickstart =async () => {
    //Google Cloud Vision Text Annotator (OCR)
    // let sample1 = './samples/davide_passport.png';
    // let sample1 = './samples/gabriele.png';
    let sample1 = './samples/Passport1.png';
    
    //Extracting the mrz and preparing it for decoding
    const [result] = await client.textDetection(sample1);
    const texts = result.textAnnotations;
    // console.log(texts)
    let mainResult = texts[0].description;
    let mrzStartPosition = mainResult.indexOf("P<");
    let mrzText = mainResult.slice(mrzStartPosition);
    let textss = mrzText.replace( /\s/g, "");
    let line1  = textss.substring(0, 44);
    let line2  = textss.substring(44, 88);
    let mrzToDecode = `${line1}\n${line2}`;


    //MRZ Parser from https://www.npmjs.com/package/mrz  
    let passportDetails = parse(mrzToDecode);
    const regex = /(?<year>[0-9]{2})(?<month>[0-9]{2})(?<day>[0-9]{2})/gm;
    const birth = regex.exec(passportDetails.fields.birthDate).groups
    const year = birth.year < new Date().getFullYear() - 100 ? parseInt(`19${birth.year}`):parseInt(`20${birth.year}`)
    passportDetails.fields.birthDate = `${year}-${birth.month}-${birth.day}`
    const regex2 = /(?<year>[0-9]{2})(?<month>[0-9]{2})(?<day>[0-9]{2})/gm;
    const expiration = regex2.exec(passportDetails.fields.expirationDate).groups
    const yearExp = parseInt(`20${expiration.year}`)
    passportDetails.fields['expirationDate'] = `${yearExp}-${expiration.month}-${expiration.day}`
    // console.log(year)
    console.log(passportDetails.fields)
    // console.log((Date.now() - start) / 1000 )
}
const start = Date.now()
  try {
    
    quickstart();
  } 
  catch (e) {
    console.error(e);
  }
app.post('/document-check', (req,res) => {

})
app.listen(port, '127.0.0.1', ()=> console.log(`Server Running Okay On ${port}`));
