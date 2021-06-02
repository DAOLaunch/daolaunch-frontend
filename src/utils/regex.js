const regex = {
  email: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  number: /^[0-9][0-9]*([.][0-9]*|)$/,
  decimal: /^[1-9][0-9]*\.?\d*$/,
  decimal0: /^\d*\.?\d*$/,
  integer: /^([1-9][0-9]*|[0])$/,
  url: /^(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/,
  decimalNumber: /^(\d+\.?\d*|\.\d+)$/,
}

export default regex