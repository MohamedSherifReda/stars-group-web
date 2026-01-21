import { bannersApi } from '@features/banner/banner.apis';
import { brandsApi } from '@features/brand/brand.apis';
import { usersApi } from '@features/user/user.apis';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ui/common/card';
import { Users, Tag, Image, TrendingUp } from 'lucide-react';
import serveDashboardMeta from '~/meta/serveDashboardMeta';

export const meta = serveDashboardMeta;

export default function Dashboard() {
  const {
    data: usersData = { data: [], meta: { total: 0, skip: 0, take: 0 } },
    isLoading: isUsersLoading,
  } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.getUsers().then((res) => res.data),
  });

  const {
    data: brands = { data: [], meta: { total: 0, skip: 0, take: 0 } },
    isLoading: isBrandsLoading,
  } = useQuery({
    queryKey: ['brands'],
    queryFn: () => brandsApi.getBrands().then((res) => res.data),
  });

  console.log('brands in the dashboard', brands);
  const {
    data: banners = { data: [], meta: { total: 0, skip: 0, take: 0 } },
    isLoading: isBannersLoading,
  } = useQuery({
    queryKey: ['banners'],
    queryFn: () =>
      bannersApi
        .getBanners({
          includeAllBranded: true,
        })
        .then((res) => res.data),
  });

  console.log('banners in the dashboard', banners);
  const stats = [
    {
      title: 'Total Users',
      value: isUsersLoading ? 'Loading...' : usersData?.meta?.total || 0,
      description: 'Registered users',
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: 'Active Brands',
      value: isBrandsLoading ? 'Loading...' : brands?.meta?.total || 0,
      description: 'Brand partners',
      icon: Tag,
      color: 'text-green-600',
    },
    {
      title: 'Live Banners',
      value: isBannersLoading ? 'Loading...' : banners?.meta?.total || 0,
      description: 'Promotional banners',
      icon: Image,
      color: 'text-purple-600',
    },
    // {
    //   title: 'Growth Rate',
    //   value: '12.5%',
    //   description: 'Monthly growth',
    //   icon: TrendingUp,
    //   color: 'text-orange-600',
    // },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome to Stars Group CMS. Here's an overview of your system.
        </p>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`}>
        {stats?.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity && system stats... */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"></div>
    </div>
  );
}
