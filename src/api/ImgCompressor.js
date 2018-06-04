import ImageCompressor from 'image-compressor.js';

export class ImgCompressor {

  compressImage(upload) {
    const options = {
      quality: .4,
      maxHeight: 500
    }
    const imageCompressor = new ImageCompressor();
    return imageCompressor.compress(upload, options)
  }

  compressSize(upload) {
    const options = {
      convertSize: 1000000
    }
    const imageCompressor = new ImageCompressor();
    return imageCompressor.compress(upload, options)
  }

}