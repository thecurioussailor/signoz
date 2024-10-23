/* eslint-disable sonarjs/cognitive-complexity */
import '../OnboardingQuestionaire.styles.scss';

import { Color } from '@signozhq/design-tokens';
import { Button, Input, Typography } from 'antd';
import logEvent from 'api/common/logEvent';
import { ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'store/reducers';
import AppReducer from 'types/reducer/app';

export interface OrgData {
	id: string;
	isAnonymous: boolean;
	name: string;
}

export interface OrgDetails {
	organisationName: string;
	usesObservability: boolean | null;
	observabilityTool: string | null;
	otherTool: string | null;
	familiarity: string | null;
}

interface OrgQuestionsProps {
	isLoading: boolean;
	orgDetails: OrgDetails;
	setOrgDetails: (details: OrgDetails) => void;
	onNext: () => void;
}

const observabilityTools = {
	AWSCloudwatch: 'AWS Cloudwatch',
	DataDog: 'DataDog',
	NewRelic: 'New Relic',
	GrafanaPrometheus: 'Grafana / Prometheus',
	AzureAppMonitor: 'Azure App Monitor',
	GCPNativeO11yTools: 'GCP-native o11y tools',
	Honeycomb: 'Honeycomb',
};

const o11yFamiliarityOptions: Record<string, string> = {
	new: "I'm completely new",
	builtStack: "I've built a stack before",
	experienced: 'I have some experience',
	dontKnow: "I don't know what it is",
};

function OrgQuestions({
	isLoading,
	orgDetails,
	setOrgDetails,
	onNext,
}: OrgQuestionsProps): JSX.Element {
	const { user } = useSelector<AppState, AppReducer>((state) => state.app);

	const [organisationName, setOrganisationName] = useState<string>(
		orgDetails?.organisationName || '',
	);
	const [usesObservability, setUsesObservability] = useState<boolean | null>(
		orgDetails?.usesObservability || null,
	);
	const [observabilityTool, setObservabilityTool] = useState<string | null>(
		orgDetails?.observabilityTool || null,
	);
	const [otherTool, setOtherTool] = useState<string>(
		orgDetails?.otherTool || '',
	);
	const [familiarity, setFamiliarity] = useState<string | null>(
		orgDetails?.familiarity || null,
	);
	const [isNextDisabled, setIsNextDisabled] = useState<boolean>(true);

	useEffect(() => {
		setOrganisationName(orgDetails.organisationName);
	}, [orgDetails.organisationName]);

	const isValidUsesObservability = (): boolean => {
		if (usesObservability === null) {
			return false;
		}

		if (usesObservability && (!observabilityTool || observabilityTool === '')) {
			return false;
		}

		// eslint-disable-next-line sonarjs/prefer-single-boolean-return
		if (usesObservability && observabilityTool === 'Others' && otherTool === '') {
			return false;
		}

		return true;
	};

	useEffect(() => {
		const isValidObservability = isValidUsesObservability();

		if (organisationName !== '' && familiarity !== null && isValidObservability) {
			setIsNextDisabled(false);
		} else {
			setIsNextDisabled(true);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		organisationName,
		usesObservability,
		familiarity,
		observabilityTool,
		otherTool,
	]);

	const handleOnNext = (): void => {
		setOrgDetails({
			organisationName,
			usesObservability,
			observabilityTool,
			otherTool,
			familiarity,
		});

		logEvent('Onboarding: Org Questions: Next', {
			organisationName,
			usesObservability,
			observabilityTool,
			otherTool,
			familiarity,
		});

		onNext();
	};

	return (
		<div className="questions-container">
			<Typography.Title level={3} className="title">
				Welcome, {user?.name}!
			</Typography.Title>
			<Typography.Paragraph className="sub-title">
				We&apos;ll help you get the most out of SigNoz, whether you&apos;re new to
				observability or a seasoned pro.
			</Typography.Paragraph>

			<div className="questions-form-container">
				<div className="questions-form">
					<div className="form-group">
						<label className="question" htmlFor="organisationName">
							Your Organisation Name
						</label>
						<input
							type="text"
							name="organisationName"
							id="organisationName"
							placeholder="For eg. Simpsonville..."
							autoComplete="off"
							value={organisationName}
							onChange={(e): void => setOrganisationName(e.target.value)}
						/>
					</div>

					<div className="form-group">
						<label className="question" htmlFor="usesObservability">
							Do you currently use any observability/monitoring tool?
						</label>

						<div className="two-column-grid">
							<Button
								type="primary"
								name="usesObservability"
								className={`onboarding-questionaire-button ${
									usesObservability === true ? 'active' : ''
								}`}
								onClick={(): void => {
									setUsesObservability(true);
								}}
							>
								Yes{' '}
								{usesObservability === true && (
									<CheckCircle size={12} color={Color.BG_FOREST_500} />
								)}
							</Button>
							<Button
								type="primary"
								className={`onboarding-questionaire-button ${
									usesObservability === false ? 'active' : ''
								}`}
								onClick={(): void => {
									setUsesObservability(false);
									setObservabilityTool(null);
									setOtherTool('');
								}}
							>
								No{' '}
								{usesObservability === false && (
									<CheckCircle size={12} color={Color.BG_FOREST_500} />
								)}
							</Button>
						</div>
					</div>

					{usesObservability && (
						<div className="form-group">
							<label className="question" htmlFor="observabilityTool">
								Which observability tool do you currently use?
							</label>
							<div className="two-column-grid">
								{Object.keys(observabilityTools).map((tool) => (
									<Button
										key={tool}
										type="primary"
										className={`onboarding-questionaire-button ${
											observabilityTool === tool ? 'active' : ''
										}`}
										onClick={(): void => setObservabilityTool(tool)}
									>
										{observabilityTools[tool as keyof typeof observabilityTools]}

										{observabilityTool === tool && (
											<CheckCircle size={12} color={Color.BG_FOREST_500} />
										)}
									</Button>
								))}

								{observabilityTool === 'Others' ? (
									<Input
										type="text"
										className="onboarding-questionaire-other-input"
										placeholder="Please specify the tool"
										value={otherTool || ''}
										autoFocus
										addonAfter={
											otherTool && otherTool !== '' ? (
												<CheckCircle size={12} color={Color.BG_FOREST_500} />
											) : (
												''
											)
										}
										onChange={(e): void => setOtherTool(e.target.value)}
									/>
								) : (
									<button
										type="button"
										className={`onboarding-questionaire-button ${
											observabilityTool === 'Others' ? 'active' : ''
										}`}
										onClick={(): void => setObservabilityTool('Others')}
									>
										Others
									</button>
								)}
							</div>
						</div>
					)}

					<div className="form-group">
						<div className="question">
							Are you familiar with observability (o11y)?
						</div>
						<div className="two-column-grid">
							{Object.keys(o11yFamiliarityOptions).map((option: string) => (
								<Button
									key={option}
									type="primary"
									className={`onboarding-questionaire-button ${
										familiarity === option ? 'active' : ''
									}`}
									onClick={(): void => setFamiliarity(option)}
								>
									{o11yFamiliarityOptions[option]}
									{familiarity === option && (
										<CheckCircle size={12} color={Color.BG_FOREST_500} />
									)}
								</Button>
							))}
						</div>
					</div>
				</div>

				<div className="next-prev-container">
					<Button
						type="primary"
						className={`next-button ${isNextDisabled ? 'disabled' : ''}`}
						onClick={handleOnNext}
						disabled={isNextDisabled}
					>
						Next
						{isLoading ? (
							<Loader2 className="animate-spin" />
						) : (
							<ArrowRight size={14} />
						)}
					</Button>
				</div>
			</div>
		</div>
	);
}

export default OrgQuestions;