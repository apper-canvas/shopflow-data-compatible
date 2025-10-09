class ApperClientSingleton {
    constructor() {
        this._client = null;
        this._isInitializing = false;
    }

    getInstance() {
        // Return existing client if available
        if (this._client) {
            return this._client;
        }

        // Check if SDK is available
        if (!window.ApperSDK) {
            console.warn('ApperSDK not available on window object');
            return null;
        }

        // Prevent multiple simultaneous initializations
        if (this._isInitializing) {
            return null;
        }

        try {
            this._isInitializing = true;

            const { ApperClient } = window.ApperSDK;

            // Validate environment variables
            const projectId = import.meta.env.VITE_APPER_PROJECT_ID;
            const publicKey = import.meta.env.VITE_APPER_PUBLIC_KEY;

            if (!projectId) {
                return null;
            }

            // Create new client instance
            this._client = new ApperClient({
                apperProjectId: projectId,
                apperPublicKey: publicKey,
            });

            return this._client;

        } catch (error) {
            return null;
        } finally {
            this._isInitializing = false;
        }
    }

    reset() {
        if (this._client) {
            this._client = null;
        }
    }

    isInitialized() {
        return this._client !== null;
    }
}

let _singletonInstance = null;

const getSingleton = () => {
    if (!_singletonInstance) {
        _singletonInstance = new ApperClientSingleton();
    }
    return _singletonInstance;
};

export const getApperClient = () => getSingleton().getInstance();

// Export singleton instance getter (lazy)
export const apperClientSingleton = {
    getInstance: () => getSingleton().getInstance(),
    reset: () => getSingleton().reset(),
    isInitialized: () => getSingleton().isInitialized()
};

export default getSingleton;
