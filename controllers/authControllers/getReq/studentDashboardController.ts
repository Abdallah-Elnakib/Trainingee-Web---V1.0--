import { Request, Response } from 'express';

export const studentDashboard = async (req: Request, res: Response): Promise<void> => {
    try {
        // Simple rendering of the student dashboard page
        // The actual data will be fetched from the frontend via API
        res.render('student-dashboard');
    } catch (error) {
        console.error('Error rendering student dashboard:', error);
        res.status(500).send('Internal Server Error');
    }
};
