import PageHeader from '@/components/page-header';
import ResourceChart from '@/components/dashboard/inventory/resource-chart';
import ResourceList from '@/components/dashboard/inventory/resource-list';
import { getInventoryResources } from '@/lib/data';
import ResourceCard from '@/components/dashboard/inventory/resource-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function DashboardPage() {
  const resources = await getInventoryResources();
  const totalResources = resources.reduce((sum, resource) => sum + resource.count, 0);

  const awsAccounts = [
    { name: 'AWS Dev1', status: 'ok' },
    { name: 'AWS project 2', status: 'ok' },
    { name: 'AWS Prod 1', status: 'ok' },
  ];

  const resourceDetails = [
    { name: "Elastic Compute Cloud (EC2)", count: 9, details: [ { label: "Running Instances", value: "1" }, { label: "Across 1 Region(s) in 3 Account(s)", value: ""}, { label: "EBS Volumes", value: "1" }, { label: "Total Storage 8 GB", value: "" } ] },
    { name: "Relational Database Service (RDS)", count: 3, details: [ { label: "DB Engines Used", value: "1" }, { label: "MySQL", value: ""}, { label: "Database Connections", value: "0" } ] },
    { name: "Simple Notification Service (SNS)", count: 6, details: [ { label: "Messages Published", value: "0" }, { label: "Notifications Delivered", value: "0" }, { label: "Notifications Failed", value: "0" } ] },
    { name: "DynamoDB", count: 3, details: [ { label: "Provisioned Read Capacity Units", value: "1" }, { label: "Provisioned Write Capacity Units", value: "1" } ] },
    { name: "Elastic Load Balancer (ELB)", count: 6, details: [ { label: "Healthy Hosts", value: "4" }, { label: "Across 1 Region(s)", value: "" }, { label: "Unhealthy Hosts", value: "0" }, { label: "Across 0 Region(s)", value: "" } ] },
    { name: "Simple Storage Service (S3)", count: 33, details: [ { label: "Buckets", value: "33" } ] },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Inventory Dashboard - All Accounts" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>AWS Resources</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1 flex flex-col items-center justify-center">
              <ResourceChart total={totalResources} />
            </div>
            <div className="md:col-span-2">
              <ResourceList resources={resources} />
            </div>
            <div className="md:col-span-1">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">AWS Account</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {awsAccounts.map(account => (
                      <li key={account.name} className="flex items-center text-sm">
                        <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                        {account.name}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resourceDetails.map(resource => (
          <ResourceCard 
            key={resource.name}
            title={resource.name}
            count={resource.count}
            details={resource.details}
          />
        ))}
      </div>
    </div>
  );
}
