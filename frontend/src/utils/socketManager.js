import { io } from 'socket.io-client';
const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const environment = process.env.NEXT_PUBLIC_ENVIRONMENT || 'development';

class SocketManager {
    constructor() {
        this.socket = null;
        this.listeners = new Map();
        this.isConnected = false;
        this.currentRoom = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
    }

    connect(token) {
        if (this.socket) {
            this.disconnect();
        }

        try {
            this.socket = io(socketUrl, {
                auth: { token },
                reconnection: true,
                reconnectionAttempts: this.maxReconnectAttempts,
                reconnectionDelay: this.reconnectDelay,
                timeout: 10000,
                transports: ['websocket', 'polling'],
                autoConnect: true,
            });

            this.setupEventListeners();
            return this.socket;
        } catch (error) {
            console.error('Socket connection error:', error);
            this.emit('connect_error', error);
            return null;
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
            this.currentRoom = null;
            this.reconnectAttempts = 0;
            this.listeners.clear();
        }
    }

    setupEventListeners() {
        if (!this.socket) return;

        this.socket.on('connect', () => {
            this.isConnected = true;
            this.reconnectAttempts = 0;
            this.emit('connect');
        });

        this.socket.on('disconnect', (reason) => {
            this.isConnected = false;
            this.emit('disconnect', reason);
            
            // Handle specific disconnect reasons
            if (reason === 'io server disconnect') {
                // Server initiated disconnect, try to reconnect
                this.socket.connect();
            }
        });

        this.socket.on('connect_error', (error) => {
            this.isConnected = false;
            this.reconnectAttempts++;
            this.emit('connect_error', error);
        });

        this.socket.on('reconnect', (attemptNumber) => {
            this.isConnected = true;
            this.reconnectAttempts = 0;
            this.emit('reconnect', attemptNumber);
        });

        this.socket.on('reconnect_attempt', (attemptNumber) => {
            this.emit('reconnect_attempt', attemptNumber);
        });

        this.socket.on('reconnect_error', (error) => {
            this.emit('reconnect_error', error);
        });

        this.socket.on('reconnect_failed', () => {
            this.emit('reconnect_failed');
        });

        // Room events
        this.socket.on('room:joined', (room) => {
            this.currentRoom = room;
            this.emit('room:joined', room);
        });

        this.socket.on('room:left', (roomId) => {
            if (this.currentRoom?.id === roomId) {
                this.currentRoom = null;
            }
            this.emit('room:left', roomId);
        });

        // Message events
        this.socket.on('message:received', (message) => {
            this.emit('message:received', message);
        });

        // Code events
        this.socket.on('code:updated', (update) => {
            this.emit('code:updated', update);
        });

        // Avatar events
        this.socket.on('avatar:moved', (update) => {
            this.emit('avatar:moved', update);
        });

        // Call events
        this.socket.on('call:received', (data) => {
            this.emit('call:received', data);
        });

        this.socket.on('call:answered', (data) => {
            this.emit('call:answered', data);
        });

        this.socket.on('ice:candidate', (data) => {
            this.emit('ice:candidate', data);
        });
    }

    // Room operations
    joinRoom(roomId) {
        return new Promise((resolve, reject) => {
            if (!this.isConnected) {
                const error = 'Cannot join room: Not connected to socket';
                this.emit('error', error);
                reject(new Error(error));
                return;
            }

            // Set up a one-time listener for the response
            const handleJoinResponse = (response) => {
                if (response.error) {
                    reject(new Error(response.error));
                } else {
                    resolve(response);
                }
            };

            // Set up a one-time listener for errors
            const handleError = (error) => {
                reject(error);
            };

            this.socket.once('join-room-response', handleJoinResponse);
            this.socket.once('room-error', handleError);

            // Emit the join event
            this.socket.emit('join-room', roomId, (response) => {
                // Remove the listeners after getting the response
                this.socket.off('join-room-response', handleJoinResponse);
                this.socket.off('room-error', handleError);

                if (response.error) {
                    reject(new Error(response.error));
                } else {
                    resolve(response);
                }
            });
        });
    }

    leaveRoom(roomId) {
        if (!this.isConnected) return false;
        this.socket.emit('room:leave', roomId);
        return true;
    }

    // Message operations
    sendMessage(roomId, message) {
        if (!this.isConnected) {
            this.emit('error', 'Cannot send message: Not connected to socket');
            return false;
        }
        this.socket.emit('message:send', { roomId, message });
        return true;
    }

    // Code operations
    updateCode(roomId, code, language) {
        if (!this.isConnected) {
            this.emit('error', 'Cannot update code: Not connected to socket');
            return false;
        }
        this.socket.emit('code:update', { roomId, code, language });
        return true;
    }

    // Avatar operations
    moveAvatar(roomId, x, y, direction) {
        if (!this.isConnected) {
            this.emit('error', 'Cannot move avatar: Not connected to socket');
            return false;
        }
        this.socket.emit('avatar:move', { roomId, x, y, direction });
        return true;
    }

    // Call operations
    initiateCall(roomId, targetUserId, offer) {
        if (!this.isConnected) {
            this.emit('error', 'Cannot initiate call: Not connected to socket');
            return false;
        }
        this.socket.emit('call:initiate', { roomId, targetUserId, offer });
        return true;
    }

    answerCall(roomId, targetUserId, answer) {
        if (!this.isConnected) {
            this.emit('error', 'Cannot answer call: Not connected to socket');
            return false;
        }
        this.socket.emit('call:answer', { roomId, targetUserId, answer });
        return true;
    }

    sendIceCandidate(roomId, targetUserId, candidate) {
        if (!this.isConnected) {
            this.emit('error', 'Cannot send ICE candidate: Not connected to socket');
            return false;
        }
        this.socket.emit('ice:candidate', { roomId, targetUserId, candidate });
        return true;
    }

    // Event handling
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);
        return () => this.off(event, callback);
    }

    off(event, callback) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).delete(callback);
        }
    }

    emit(event, ...args) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => callback(...args));
        }
    }

    // Getters
    getSocket() {
        return this.socket;
    }

    getConnectionStatus() {
        return this.isConnected;
    }

    getCurrentRoom() {
        return this.currentRoom;
    }

    getReconnectAttempts() {
        return this.reconnectAttempts;
    }
}

// Export a singleton instance
export default new SocketManager();