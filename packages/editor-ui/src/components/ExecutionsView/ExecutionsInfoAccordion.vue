<template>
	<n8n-info-accordion
		:class="[$style.accordion, 'mt-2xl']"
		:title="$locale.baseText('executionsLandingPage.emptyState.accordion.title')"
		:items="accordionItems"
		:description="accordionDescription"
		:initiallyExpanded="shouldExpandAccordion"
		:headerIcon="accordionIcon"
		@click="onAccordionClick"
		@tooltipClick="onItemTooltipClick"
	></n8n-info-accordion>
</template>

<script lang="ts">
import { WORKFLOW_SETTINGS_MODAL_KEY } from '@/constants';
import { deepCopy, IWorkflowSettings } from 'n8n-workflow';
import Vue from 'vue';

interface IWorkflowSaveSettings {
	saveFailedExecutions: boolean,
	saveSuccessfulExecutions: boolean,
	saveManualExecutions: boolean,
};

export default Vue.extend({
	name: 'executions-info-accordion',
	props: {
		initiallyExpanded: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {
			defaultValues: {
				saveFailedExecutions: 'all',
				saveSuccessfulExecutions: 'all',
				saveManualExecutions: false,
			},
			workflowSaveSettings: {
				saveFailedExecutions: false,
				saveSuccessfulExecutions: false,
				saveManualExecutions: false,
			} as IWorkflowSaveSettings,
		};
	},
	mounted() {
		this.defaultValues.saveFailedExecutions = this.$store.getters.saveDataErrorExecution;
		this.defaultValues.saveSuccessfulExecutions = this.$store.getters.saveDataSuccessExecution;
		this.defaultValues.saveManualExecutions = this.$store.getters.saveManualExecutions;
		this.updateSettings(this.workflowSettings);
	},
	watch: {
		workflowSettings(newSettings: IWorkflowSettings) {
			this.updateSettings(newSettings);
		},
	},
	computed: {
			accordionItems(): Object[] {
			return [
				{
					id: 'productionExecutions',
					label: this.$locale.baseText('executionsLandingPage.emptyState.accordion.productionExecutions'),
					icon: this.productionExecutionsIcon.icon,
					iconColor: this.productionExecutionsIcon.color,
					tooltip: this.productionExecutionsStatus === 'unknown' ? this.$locale.baseText('executionsLandingPage.emptyState.accordion.productionExecutionsWarningTooltip') : null,
				},
				{
					id: 'manualExecutions',
					label: this.$locale.baseText('executionsLandingPage.emptyState.accordion.manualExecutions'),
					icon: this.workflowSaveSettings.saveManualExecutions ? 'check' : 'times',
					iconColor: this.workflowSaveSettings.saveManualExecutions ? 'success' : 'danger',
				},
			];
		},
		shouldExpandAccordion(): boolean {
			if (this.initiallyExpanded === false) {
				return false;
			}
			return this.workflowSaveSettings.saveFailedExecutions === false ||
				this.workflowSaveSettings.saveSuccessfulExecutions === false ||
				this.workflowSaveSettings.saveManualExecutions === false;
		},
		productionExecutionsIcon(): { icon: string, color: string } {
			if (this.productionExecutionsStatus === 'saving') {
				return { icon: 'check', color: 'success' };
			} else if (this.productionExecutionsStatus === 'not-saving') {
				return { icon: 'times', color: 'danger' };
			}
			return { icon: 'exclamation-triangle', color: 'warning' };
		},
		productionExecutionsStatus(): string {
			if (this.workflowSaveSettings.saveSuccessfulExecutions === this.workflowSaveSettings.saveFailedExecutions) {
				if (this.workflowSaveSettings.saveSuccessfulExecutions === true) {
					return 'saving';
				}
				return 'not-saving';
			} else {
				return 'unknown';
			}
		},
		workflowSettings(): IWorkflowSettings {
			const workflowSettings = deepCopy(this.$store.getters.workflowSettings);
			return workflowSettings;
		},
		accordionDescription(): string {
			return `
				<footer class="mt-2xs">
					${this.$locale.baseText('executionsLandingPage.emptyState.accordion.footer')}
				</footer>
			`;
		},
		accordionIcon(): { icon: string, color: string }|null {
			if (this.workflowSaveSettings.saveManualExecutions !== true || this.productionExecutionsStatus !== 'saving') {
				return { icon: 'exclamation-triangle', color: 'warning' };
			}
			return null;
		},
	},
	methods: {
		updateSettings(settingsInStore: IWorkflowSettings): void {
			this.workflowSaveSettings.saveFailedExecutions = settingsInStore.saveDataErrorExecution !== 'none';
			this.workflowSaveSettings.saveSuccessfulExecutions = settingsInStore.saveDataSuccessExecution !== 'none';
			this.workflowSaveSettings.saveManualExecutions = settingsInStore.saveManualExecutions === undefined ? this.defaultValues.saveManualExecutions : settingsInStore.saveManualExecutions as boolean;
		},
		onAccordionClick(event: MouseEvent): void {
			if (event.target instanceof HTMLAnchorElement) {
				event.preventDefault();
				this.$store.dispatch('ui/openModal', WORKFLOW_SETTINGS_MODAL_KEY);
			}
		},
		onItemTooltipClick(item: string, event: MouseEvent): void {
			if (item === 'productionExecutions' && event.target instanceof HTMLAnchorElement) {
				event.preventDefault();
				this.$store.dispatch('ui/openModal', WORKFLOW_SETTINGS_MODAL_KEY);
			}
		},
	},
});
</script>

<style module lang="scss">

.accordion {
	background: none;
	width: 320px;

	// Accordion header
	& > div:nth-child(1) {
		display: flex;
		flex-direction: row;
		padding: var(--spacing-xs);
		width: 100%;
		user-select: none;
		color: var(--color-text-base) !important;
	}

	// Accordion description
	& > div:nth-child(2) {
		display: flex;
		flex-direction: column;
		width: 100%;
		padding: 0 var(--spacing-l) var(--spacing-s) !important;

		span { width: 100%; }
	}

	footer {
		text-align: left;
		width: 100%;
	}
}

</style>
