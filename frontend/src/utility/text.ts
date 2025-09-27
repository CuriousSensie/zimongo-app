// helper functions to deal with text
export function capitalizeFirstLetter(str: string) {
  if (str.length === 0) {
    return "";
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function capitalizeEachWord(sentence: string) {
  return sentence
    .split(" ")
    .map((word) => capitalizeFirstLetter(word))
    .join(" ");
}

export function cleanText(text: string) {
  return capitalizeEachWord(text.replace("_", " "));
}
