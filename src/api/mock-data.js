export default function (data, error, condition = true) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (condition) {
        resolve(dataProject)
      } else {
        reject(new Error(error))
      }
    }, 1000)
  })
}
