const { nanoid } = require('nanoid');
const { DBUtils } = require('../utils');
const { InvariantError } = require('../exceptions');
const tableNames = 'playlist_song_activities';

class PlaylistsActivitiesService {
    constructor() {
        this._dbUtils = new DBUtils();
    }

    async addActivity({ playlist_id, song_id, user_id }) {
        const id = `activity-${nanoid(16)}`;
        const time = new Date().toISOString();

        const values = [id, playlist_id, song_id, user_id, 'add', time];

        const rows = await this._dbUtils.insert(tableNames, values);
        if (!rows[0]?.id) throw new InvariantError('Playlist Activities gagal ditambahkan.');
        return rows[0].id;
    }

    async deleteActivity({ playlist_id, song_id, user_id }) {
        const id = `activity-${nanoid(16)}`;
        const time = new Date().toISOString();

        const values = [id, playlist_id, song_id, user_id, 'delete', time];

        const rows = await this._dbUtils.insert(tableNames, values);
        if (!rows[0]?.id) throw new InvariantError('Playlist Activities gagal ditambahkan.');
        return rows[0].id;
    }

    async getActivities(playlist_id) {
        const rows = await this._dbUtils.select(['username', 'title', 'action', 'time'], tableNames, 'playlist_id = $1', [playlist_id], 'INNER', ['users', 'songs'], ['users.id = playlist_song_activities.user_id', 'songs.id = playlist_song_activities.song_id']);
        return rows;
    }
}

module.exports = PlaylistsActivitiesService;