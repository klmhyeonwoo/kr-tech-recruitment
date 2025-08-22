declare module "*.mp4" {
  const src: string;
  export default src;
}
declare module "*.gif" {
  const src: string | StaticImageData;
  export default src;
}
declare module "*.png" {
  const src: string |StaticImageData
  export default src;
}
declare module "*.svg" {
  const src: string;
  export default src;
}
