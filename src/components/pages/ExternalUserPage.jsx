import React from "react"
import { useSelector } from "react-redux"
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"
import Badge from "@/components/atoms/Badge"

const ExternalUserPage = () => {
    const { user, isAuthenticated } = useSelector((state) => state.user)

    if (!isAuthenticated) {
        return (
            <div className="max-w-6xl mx-auto p-6">
                <div className="text-center py-12">
                    <ApperIcon name="Lock" size={48} className="text-gray-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-primary mb-2">Please Sign In</h2>
                    <p className="text-secondary mb-6">You need to be logged in to access this page</p>
                    <Button onClick={() => window.location.href = '/login'}>
                        Sign In
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <h1 className="text-3xl font-bold text-primary">External User Portal</h1>
                    <Badge className="bg-purple-100 text-purple-800 font-medium">
                        External Access
                    </Badge>
                </div>
                <p className="text-secondary">
                    Welcome to the external user portal. This area is exclusively for external users.
                </p>
            </div>

            {/* User Info Card */}
            <div className="bg-surface rounded-lg shadow-card border border-gray-100 p-6 mb-6">
                <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <ApperIcon name="UserCircle" size={32} className="text-white" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-semibold text-primary mb-1">
                            {user?.name || user?.email || 'External User'}
                        </h2>
                        <p className="text-secondary text-sm mb-3">
                            {user?.email || 'No email available'}
                        </p>
                        <div className="flex items-center gap-2">
                            <Badge className="bg-green-100 text-green-800">
                                <ApperIcon name="CheckCircle" size={12} className="mr-1" />
                                Verified External User
                            </Badge>
                            {user?.userMetadata?.organization && (
                                <Badge className="bg-blue-100 text-blue-800">
                                    {user.userMetadata.organization}
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* External Resources */}
                <div className="bg-surface rounded-lg shadow-card border border-gray-100 p-6 hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                        <ApperIcon name="FileText" size={24} className="text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-primary mb-2">
                        External Resources
                    </h3>
                    <p className="text-secondary text-sm mb-4">
                        Access documentation and resources specifically designed for external partners.
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                        View Resources
                    </Button>
                </div>

                {/* External Reports */}
                <div className="bg-surface rounded-lg shadow-card border border-gray-100 p-6 hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                        <ApperIcon name="BarChart" size={24} className="text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-primary mb-2">
                        Reports & Analytics
                    </h3>
                    <p className="text-secondary text-sm mb-4">
                        View reports and analytics data shared with external users.
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                        View Reports
                    </Button>
                </div>

                {/* External API */}
                <div className="bg-surface rounded-lg shadow-card border border-gray-100 p-6 hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                        <ApperIcon name="Code" size={24} className="text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-primary mb-2">
                        API Access
                    </h3>
                    <p className="text-secondary text-sm mb-4">
                        Manage your API credentials and integration settings.
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                        API Settings
                    </Button>
                </div>

                {/* External Support */}
                <div className="bg-surface rounded-lg shadow-card border border-gray-100 p-6 hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                        <ApperIcon name="MessageCircle" size={24} className="text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-primary mb-2">
                        Support
                    </h3>
                    <p className="text-secondary text-sm mb-4">
                        Get help from our dedicated external partner support team.
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                        Contact Support
                    </Button>
                </div>

                {/* External Settings */}
                <div className="bg-surface rounded-lg shadow-card border border-gray-100 p-6 hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                        <ApperIcon name="Settings" size={24} className="text-orange-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-primary mb-2">
                        Settings
                    </h3>
                    <p className="text-secondary text-sm mb-4">
                        Manage your external account preferences and notifications.
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                        Manage Settings
                    </Button>
                </div>

                {/* External Activity */}
                <div className="bg-surface rounded-lg shadow-card border border-gray-100 p-6 hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                        <ApperIcon name="Activity" size={24} className="text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-primary mb-2">
                        Activity Log
                    </h3>
                    <p className="text-secondary text-sm mb-4">
                        View your activity history and access logs.
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                        View Activity
                    </Button>
                </div>
            </div>

            {/* Info Banner */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-6">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <ApperIcon name="Info" size={20} className="text-purple-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-primary mb-1">External User Access</h3>
                        <p className="text-secondary text-sm">
                            As an external user, you have access to specific features and resources.
                            If you need additional permissions or have questions about your access level,
                            please contact your account administrator.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ExternalUserPage

