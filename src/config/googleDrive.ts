import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

// Configuración de Google Drive
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const SERVICE_ACCOUNT_FILE = path.join(__dirname, '../credentials/service-account-key.json');

class GoogleDriveService {
    private drive: any = null;
    private initializationPromise: Promise<void> | null = null;

    private async initializeDrive(): Promise<void> {
        if (this.initializationPromise) {
            return this.initializationPromise;
        }

        this.initializationPromise = this._initialize();
        return this.initializationPromise;
    }

    private async _initialize(): Promise<void> {
        try {
            console.log('Inicializando Google Drive...');
            console.log('Buscando archivo de credenciales en:', SERVICE_ACCOUNT_FILE);
            
            // Verificar que el archivo de credenciales existe
            if (!fs.existsSync(SERVICE_ACCOUNT_FILE)) {
                throw new Error(`Archivo de credenciales no encontrado: ${SERVICE_ACCOUNT_FILE}`);
            }

            // Autenticación con Service Account
            const auth = new google.auth.GoogleAuth({
                keyFile: SERVICE_ACCOUNT_FILE,
                scopes: SCOPES,
            });

            this.drive = google.drive({ version: 'v3', auth });
            
            console.log('✓ Google Drive inicializado correctamente');
        } catch (error) {
            console.error('❌ Error inicializando Google Drive:', error);
            this.initializationPromise = null; // Reset para permitir reintentos
            throw error;
        }
    }

    async uploadFile(filePath: string, fileName: string, mimeType: string): Promise<string> {
        try {
            await this.initializeDrive();

            console.log(`Subiendo archivo: ${fileName}`);
            
            const fileMetadata = {
                name: fileName,
                parents: [process.env.GOOGLE_DRIVE_FOLDER_ID], // ID de la carpeta en Drive
            };

            const media = {
                mimeType: mimeType,
                body: fs.createReadStream(filePath),
            };

            const response = await this.drive.files.create({
                resource: fileMetadata,
                media: media,
                fields: 'id',
            });

            console.log(`✓ Archivo subido con ID: ${response.data.id}`);

            // Hacer el archivo público para poder accederlo desde el frontend
            await this.drive.permissions.create({
                fileId: response.data.id,
                resource: {
                    role: 'reader',
                    type: 'anyone',
                },
            });

            console.log('✓ Permisos públicos configurados');

            // Retornar la URL pública del archivo
            const publicUrl = `https://drive.google.com/uc?id=${response.data.id}`;
            console.log('✓ URL pública generada:', publicUrl);
            
            return publicUrl;
        } catch (error) {
            console.error('❌ Error subiendo archivo a Google Drive:', error);
            throw error;
        }
    }

    async deleteFile(fileId: string): Promise<void> {
        try {
            await this.initializeDrive();

            await this.drive.files.delete({
                fileId: fileId,
            });
            
            console.log(`✓ Archivo eliminado: ${fileId}`);
        } catch (error) {
            console.error('❌ Error eliminando archivo de Google Drive:', error);
            throw error;
        }
    }

    // Extraer ID del archivo desde la URL de Google Drive
    extractFileId(driveUrl: string): string | null {
        const match = driveUrl.match(/[?&]id=([a-zA-Z0-9-_]+)/);
        return match ? match[1] : null;
    }
}

export default new GoogleDriveService();