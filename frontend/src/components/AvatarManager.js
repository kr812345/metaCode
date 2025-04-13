'use client'
import React, { useState, useRef, useEffect } from 'react';
import * as Phaser from 'phaser';
import { useRouter } from 'next/navigation';
import SnakeGame from './SnakeGame';

const AvatarManager = ({ roomId, user, members, onAvatarMove }) => {
    const gameRef = useRef(null);
    const [gameInstance, setGameInstance] = useState(null);
    const [inCodingZone, setInCodingZone] = useState(false);
    const [inGameZone, setInGameZone] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (!gameRef.current) return;

        const config = {
            type: Phaser.AUTO,
            parent: gameRef.current,
            width: '100%',
            height: '100%',
            scene: {
                preload: preload,
                create: create,
                update: update
            },
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 0 },
                    debug: false
                }
            }
        };

        const game = new Phaser.Game(config);
        setGameInstance(game);

        function preload() {
            this.load.image('avatar', '/avatar.svg');
            this.load.image('background', '/room-background.svg');
            this.load.image('codingZone', '/coding-zone.svg');
            this.load.image('gameZone', '/game-zone.svg');
        }

        let player;
        let cursors;
        let otherPlayers = {};
        let codingZone;
        let gameZone;
        let enterKey;
        let isPlayerInCodingZone = false;
        let isPlayerInGameZone = false;

        function create() {
            const bg = this.add.image(0, 0, 'background');
            bg.setOrigin(0, 0);
            bg.setDisplaySize(gameRef.current.clientWidth, gameRef.current.clientHeight-100);

            codingZone = this.add.image(600, 300, 'codingZone').setScale(0.5);
            codingZone.setInteractive();
            this.physics.add.existing(codingZone, true);
            this.add.text(560, 250, 'Coding Zone', { 
                fontFamily: 'Arial', 
                fontSize: 14, 
                color: '#ffffff',
                align: 'center'
            });

            gameZone = this.add.image(200, 300, 'gameZone').setScale(0.5);
            gameZone.setInteractive();
            this.physics.add.existing(gameZone, true);
            this.add.text(160, 250, 'Game Zone', { 
                fontFamily: 'Arial', 
                fontSize: 14, 
                color: '#ffffff',
                align: 'center'
            });

            player = this.physics.add.sprite(400, 300, 'avatar');
            player.setCollideWorldBounds(true);

            cursors = this.input.keyboard.createCursorKeys();
            enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

            members.forEach(member => {
                if (member.userId !== user.id) {
                    const otherPlayer = this.physics.add.sprite(
                        Phaser.Math.Between(0, 800), 
                        Phaser.Math.Between(0, 600), 
                        'avatar'
                    );
                    otherPlayers[member.userId] = otherPlayer;
                }
            });

            this.physics.add.overlap(player, codingZone, () => {
                if (!isPlayerInCodingZone) {
                    isPlayerInCodingZone = true;
                    setInCodingZone(true);
                }
            }, null, this);

            this.physics.add.overlap(player, gameZone, () => {
                if (!isPlayerInGameZone) {
                    isPlayerInGameZone = true;
                    setInGameZone(true);
                }
            }, null, this);
        }

        function update() {
            if (!player || !cursors) return;

            const touchingCodingZone = this.physics.overlap(player, codingZone);
            if (isPlayerInCodingZone && !touchingCodingZone) {
                isPlayerInCodingZone = false;
                setInCodingZone(false);
            }

            const touchingGameZone = this.physics.overlap(player, gameZone);
            if (isPlayerInGameZone && !touchingGameZone) {
                isPlayerInGameZone = false;
                setInGameZone(false);
            }

            if (isPlayerInCodingZone && Phaser.Input.Keyboard.JustDown(enterKey)) {
                router.push(`/code/${roomId}`);
            }

            if (isPlayerInGameZone && Phaser.Input.Keyboard.JustDown(enterKey)) {
                router.push('/game');
            }

            const speed = 200;
            let direction = 'idle';

            if (cursors.left.isDown) {
                player.setVelocityX(-speed);
                direction = 'left';
            } else if (cursors.right.isDown) {
                player.setVelocityX(speed);
                direction = 'right';
            } else {
                player.setVelocityX(0);
            }

            if (cursors.up.isDown) {
                player.setVelocityY(-speed);
                direction = 'up';
            } else if (cursors.down.isDown) {
                player.setVelocityY(speed);
                direction = 'down';
            } else {
                player.setVelocityY(0);
            }

            if (direction !== 'idle') {
                onAvatarMove(player.x, player.y, direction);
            }
        }

        return () => {
            game.destroy(true);
        };
    }, [roomId, user, members, router]);

    return (
        <div className="h-full relative">
            <h3 className="text-xl text-center font-bold my-3 text-[#0DF2FF]">Room</h3>
            <div className="relative overflow-clip h-[86vh] rounded-lg w-[99%] mx-auto">
                <div ref={gameRef} className="w-full bg-[#0A2342] rounded-lg"></div>
                {inCodingZone && (
                    <div className="absolute bottom-4 left-0 right-0 text-center bg-black bg-opacity-70 p-2 rounded mx-auto max-w-xs">
                        <p className="text-white text-sm">Press Enter to open the code editor</p>
                    </div>
                )}
                {inGameZone && (
                    <div className="absolute bottom-4 left-0 right-0 text-center bg-black bg-opacity-70 p-2 rounded mx-auto max-w-xs">
                        <p className="text-white text-sm">Press Enter to open the game</p>
                    </div>
                )}
            </div>
            <div className="mt-4">
                {members.map(member => (
                    <div 
                        key={member.userId} 
                        className="flex items-center space-x-2 mb-2"
                    >
                        <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                            style={{ backgroundColor: member.avatar?.color || '#3498db' }}
                        >
                            {member.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <span>{member.name || 'Unknown User'}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AvatarManager;