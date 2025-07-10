import { Home, Search, MessageCircle, User, TrendingUp, Building, Package, Settings, Bookmark} from 'lucide-react';


export const navigationItems = [
  { icon: Home, label: 'Home', route: '/'},
  { icon: Search, label: 'Search', route: '/search'},
  { icon: MessageCircle, label: 'Messages', route: '/chats'},
  { icon: User, label: 'Profile', route: '/profile'},
];

export const discoverItems = [
  { icon: TrendingUp, label: 'Trending', route: '/trending' },
  { icon: Building, label: 'Businesses', route: '/businesses' },
  { icon: Package, label: 'Products', route: '/products' },
  { icon: Settings, label: 'Services', route: '/services' },
  { icon: Bookmark, label: 'Saved', route: '/saved' },
];