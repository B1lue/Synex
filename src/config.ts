import dotenv from 'dotenv';
dotenv.config();

export const config = {
    discordToken: process.env.DISCORD_TOKEN || 'MTM0NjU2MjQ5OTI0MzQwOTQ1OQ.G2EWv7.wDSVaygbs11XSgcNTi_HoWfxpftG27KoLa3SBU',
    fivemServerUrl: process.env.FIVEM_SERVER_URL || ''
};