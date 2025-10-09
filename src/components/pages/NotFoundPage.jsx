import React from "react";
import { Link } from "react-router-dom";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const NotFoundPage = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-900">
            <div className="w-full max-w-md p-8 bg-white dark:bg-surface-800 rounded-lg shadow-lg text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ApperIcon name="AlertCircle" size={48} className="text-primary" />
                </div>
                <h1 className="text-6xl font-bold text-primary mb-4">
                    404
                </h1>
                <h2 className="text-2xl font-semibold text-surface-900 dark:text-surface-100 mb-4">
                    Page Not Found
                </h2>
                <p className="text-surface-600 dark:text-surface-400 mb-8">
                    The page you are looking for doesn't exist.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/">
                        <Button variant="default" className="w-full sm:w-auto">
                            <ApperIcon name="Home" size={16} className="mr-2" />
                            Go to Home
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;

