import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';

// Escolher um WAV no celular (Arquivos, iCloud, Drive). Na web: escolherAudio.web.ts.
export type Audio = { nome: string; bytes: Uint8Array };

export async function escolherAudio(): Promise<Audio | null> {
  // copyToCacheDirectory: o arquivo precisa estar no cache para ser lido logo depois.
  const r = await DocumentPicker.getDocumentAsync({ type: ['audio/wav', 'audio/x-wav', 'audio/*'], copyToCacheDirectory: true });
  if (r.canceled || !r.assets[0]) return null;
  const asset = r.assets[0];
  return { nome: asset.name, bytes: await new File(asset.uri).bytes() };
}

// Arrastar e soltar só existe na web.
export function useSoltarArquivo(_aoSoltar: (a: Audio) => void): void {}
