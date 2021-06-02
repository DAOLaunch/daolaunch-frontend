const getParseCSVData = async function(data, key) {
    let newLinebrk = data.split("\n");
    newLinebrk = newLinebrk.map(d => d.trim());
    let k = newLinebrk.shift();
    return (k === key) && newLinebrk;
}


export const getCSV = async (csvFile, key) => {
    return new Promise((resolve) => {
        var reader = new FileReader();
        reader.onloadend = () => resolve(getParseCSVData(reader.result, key))
        reader.readAsBinaryString(csvFile);
    })
}
