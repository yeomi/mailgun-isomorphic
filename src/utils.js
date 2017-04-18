
export default class Utils {

  static _toBase64(string) {
    return new Buffer(string).toString('base64')
  }
  
  static isEmpty(value) {
    if (typeof value === "undefined")
      return true

    if (typeof value === "string" && value === "")
      return true

    if (typeof value === "object" && value.length < 1)
      return true

    return false
  }

  static arrayChunk(arr, chunk_size) {
    let i, j = arr.length, outputArr = [];
    for (i = 0; i < j; i += chunk_size)
      outputArr.push(arr.slice(i, i + chunk_size));

    return outputArr
  }

  // @todo needs validator
  // static filterAndValidateEmails(emails) {
  //   let objectList = {}
  //   for (let email of emails) {
  //     if (validator.isEmail(email))
  //       objectList[email] = email;
  //   }
  //   return Object.keys(objectList);
  // }

}