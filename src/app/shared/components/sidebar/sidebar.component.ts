import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, Route } from '@angular/router';

export interface MenuItem {
	title: string;
	icon?: string;
	path?: string;
	isDropdown?: boolean;
	children?: MenuItem[];
}

@Component({
	selector: 'app-sidebar',
	standalone: true,
	imports: [CommonModule, RouterModule],
	templateUrl: './sidebar.component.html'
})
export class SidebarComponent {
	private router = inject(Router);

	menuItems = signal<MenuItem[]>([]);
	openDropdowns = signal<{ [key: string]: boolean }>({});

	constructor() {
		this.buildMenuFromRoutes();
	}

	private buildMenuFromRoutes(): void {
		const adminRoute = this.router.config.find(r => r.path === 'admin');
		if (!adminRoute || !adminRoute.children) return;

		const items: MenuItem[] = adminRoute.children
			.filter(r => r.data && r.data['title'])
			.map(r => this.mapRouteToMenuItem(r, 'admin'));

		this.menuItems.set(items);
	}

	private mapRouteToMenuItem(route: Route, parentPath: string): MenuItem {
		const currentPath = `${parentPath}/${route.path}`;
		const item: MenuItem = {
			title: route.data?.['title'],
			icon: route.data?.['icon'],
			isDropdown: !!route.data?.['isDropdown'],
			path: route.children ? undefined : currentPath
		};

		if (route.children) {
			item.children = route.children
				.filter(child => child.data && child.data['title'])
				.map(child => this.mapRouteToMenuItem(child, currentPath));
		}

		return item;
	}

	toggleDropdown(title: string): void {
		this.openDropdowns.update(state => ({
			...state,
			[title]: !state[title]
		}));
	}

	isDropdownOpen(title: string): boolean {
		return !!this.openDropdowns()[title];
	}
}