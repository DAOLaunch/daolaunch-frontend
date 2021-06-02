const valuesTrim = (values) => {
  Object.keys(values).forEach((x) => {
    if (values[x] && typeof values[x] === 'string') {
      values[x] = values[x].trim()
    }
  })
  return values
}

export {
  valuesTrim
}