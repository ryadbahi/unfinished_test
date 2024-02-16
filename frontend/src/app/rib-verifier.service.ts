import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RibVerifierService {
  constructor() {}

  verifyRIB(rib: string, keyTooltip: { calculkey?: string }): boolean {
    const bankCode = rib.substring(0, 3);
    const agency = rib.substring(3, 8);
    const accountNumber = rib.substring(8, 18);
    const inputKey = rib.substring(18);

    //_______________CCP___________________________
    if (bankCode === '007') {
      const ccpstep1 = parseInt(accountNumber);
      const ccpstep2 = ccpstep1 * 100;
      const ccpstep3 = ccpstep2 % 97;
      const ccpstep4 = ccpstep3 + 85 > 97 ? ccpstep3 + 85 - 97 : ccpstep3 + 85;
      const ccpstep5 = ccpstep4 == 97 ? ccpstep4 : 97 - ccpstep4;
      const calculateCcpKey = ccpstep5 < 10 ? `0${ccpstep5}` : `${ccpstep5}`;

      keyTooltip.calculkey = calculateCcpKey;
      return calculateCcpKey === inputKey;
    } else {
      const concatenatedNumber = parseInt(agency + accountNumber);

      //_______________BANK___________________________
      const step1Result = concatenatedNumber * 100;
      //const step2Result = step1Result / 97;
      //const step3Result = Math.floor(step2Result);
      //const step4Result = step3Result * 97;
      //const step5Result = step1Result - step4Result;
      const step5Result = step1Result % 97;
      const step6Result = 97 - step5Result;

      // Check if the input key is correct
      const calculatedKey =
        step6Result < 10 ? `0${step6Result}` : `${step6Result}`;

      // Compare calculated key with the input key
      keyTooltip.calculkey = calculatedKey;
      return calculatedKey === inputKey;
    }
  }
}
