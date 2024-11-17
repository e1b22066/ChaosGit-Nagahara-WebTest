export default class TaskValidator {
    constructor() {}

    async validate(type, params) {
        // Check if the type and params are valid
        if (!type || !params) {
            throw new Error('Invalid type or parameters');
        }

        // Perform actual validation
        if (type === 'gitInit') {
            const { directory } = params;
            
            if (!directory) {
                return { success: false, message: 'Directory not provided' };
            }

            try {
                const gitDirPath = path.join(directory, '.git');
                const stats = await fs.stat(gitDirPath);

                if (stats.isDirectory()) {
                    return { success: true, message: '.git directory exists' };
                } else {
                    return { success: false, message: '.git is not a directory' };
                }
            } catch (error) {
                if (error.code === 'ENOENT') {
                    return { success: false, message: '.git directory not found' };
                } else {
                    return { success: false, message: `Error checking .git directory: ${error.message}` };
                }
            }
        } else {
            return { success: false, message: 'Invalid task type' };
        }
    }

    async checkGitInit(directory) {
        const response = await fetch('http://localhost:3000/validate-git-init', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ directory }),
        });
        return await response.json();
    }

    async checkBranchCreated(branchName) {
        const response = await fetch('http://localhost:3000/validate-branch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ branchName }),
        });
        return await response.json();
    }

    async checkCommit(commitMessage) {
        const response = await fetch('http://localhost:3000/validate-commit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ commitMessage }),
        });
        return await response.json();
    }
}