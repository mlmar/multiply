const isMobile = typeof window.orientation !== "undefined";

export const shareText = async function(text) {
  text += '\n' + 'https://mlmar.github.io/multiply';
  if(isMobile && navigator.canShare) {
    const shareData = {
      text: text
    }
    if (navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        alert('Sharing not supported for this device.');
      }
    }
  } else if(navigator.clipboard) {
    navigator.clipboard.writeText(text);
  }
}