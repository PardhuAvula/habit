const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const h = await prisma.habit.create({
            data: {
                userId: 1, // Assuming there's a user 1
                title: 'Test Habit',
                category: 'Health',
                frequency: 'daily',
                difficulty: 'medium',
                streak: {
                    create: {
                        currentStreak: 0,
                        longestStreak: 0
                    }
                }
            }
        });
        console.log('Success:', h);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await prisma.$disconnect();
    }
}
main();
