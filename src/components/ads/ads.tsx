export default function Ads() {
  const ampAdHTML = `
    <amp-ad
      width="100vw"
      height="320"
      type="adsense"
      data-ad-client="ca-pub-1550225145364569"
      data-ad-slot="6016093098"
      data-auto-format="rspv"
      data-full-width=""
    >
      <div overflow=""></div>
    </amp-ad>
  `;

  return <section dangerouslySetInnerHTML={{ __html: ampAdHTML }}></section>;
}
