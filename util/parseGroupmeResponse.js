function parseGroupmeError(textResponse) {
    if (textResponse === "") return false;
    let jsonResponse;
    try {
        jsonResponse = JSON.parse(textResponse);
    } catch {
        console.warn("We got an unexpected response:", text);
        return textResponse;
    }
    let errorString = "";
    for (const error of jsonResponse.meta.errors) errorString += error + ", ";
    errorString = errorString.substring(0, errorString.length-2);
    return `Failed to send (${jsonResponse.meta.code}): ${errorString}`;
}

module.exports = { parseGroupmeError };