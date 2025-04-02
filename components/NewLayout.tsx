import { ChevronLeft, Plus } from 'lucide-react-native';
import React from 'react';
import {
	View,
	Text,
	ScrollView,
	TouchableOpacity,
	StyleSheet,
	SafeAreaView,
	StatusBar,
} from 'react-native';

const NewLayout = () => {
	const coffeeData = {
		basicInfo: {
			roaster: 'MAME',
			origin: 'Colombia',
			producer: 'Julio Cesar Madrid',
			farm: 'Finca Milan',
			process: 'Intentional Bacterial Fermentation',
			variety: 'Caturra',
			elevation: '1500',
			roastLevel: 'Light',
		},
		brewingParams: {
			coffeeIn: '11.9',
			ratio: '17',
			waterIn: '202',
			beverageWeight: '170',
			temperature: '92',
		},
		equipment: {
			brewer: 'April Plastic',
			filterPaper: 'April Paper Filter Large',
			water: '0',
			grinder: 'Comandante X25',
			grindSetting: '20',
		},
		technicalDetails: {
			tds: '1.30',
		},
	};

	const renderDataRow = (label, value) => (
		<View style={styles.dataRow}>
			<Text style={styles.dataLabel}>{label}</Text>
			<Text style={styles.dataValue}>{value}</Text>
		</View>
	);

	return (
		<SafeAreaView style={styles.container}>
			<StatusBar barStyle="light-content" backgroundColor="#121212" />

			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity style={styles.backButton}>
					<ChevronLeft />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Recipe Details</Text>
				<View style={styles.headerRightPlaceholder} />
			</View>

			{/* Content */}
			<ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
				{/* Basic Information Card */}
				<View style={styles.card}>
					<View style={[styles.cardHeader, { backgroundColor: '#3B82F6' }]}>
						<Text style={styles.cardTitle}>Coffee Identity</Text>
					</View>
					<View style={styles.cardContent}>
						{renderDataRow('Roaster', coffeeData.basicInfo.roaster)}
						{renderDataRow('Origin', coffeeData.basicInfo.origin)}
						{renderDataRow('Producer', coffeeData.basicInfo.producer)}
						{renderDataRow('Farm', coffeeData.basicInfo.farm)}
						{renderDataRow('Process', coffeeData.basicInfo.process)}
						{renderDataRow('Variety', coffeeData.basicInfo.variety)}
						{renderDataRow('Elevation (masl)', coffeeData.basicInfo.elevation)}
						{renderDataRow('Roast Level', coffeeData.basicInfo.roastLevel)}
					</View>
				</View>

				{/* Brewing Parameters Card */}
				<View style={styles.card}>
					<View style={[styles.cardHeader, { backgroundColor: '#10B981' }]}>
						<Text style={styles.cardTitle}>Brewing Parameters</Text>
					</View>
					<View style={styles.parameterGrid}>
						<View style={styles.parameterCell}>
							<Text style={styles.parameterLabel}>Coffee (g)</Text>
							<Text style={styles.parameterValue}>
								{coffeeData.brewingParams.coffeeIn}
							</Text>
						</View>
						<View style={styles.parameterCell}>
							<Text style={styles.parameterLabel}>Ratio</Text>
							<Text style={styles.parameterValue}>
								1:{coffeeData.brewingParams.ratio}
							</Text>
						</View>
						<View style={styles.parameterCell}>
							<Text style={styles.parameterLabel}>Water (g)</Text>
							<Text style={styles.parameterValue}>
								{coffeeData.brewingParams.waterIn}
							</Text>
						</View>
						<View style={styles.parameterCell}>
							<Text style={styles.parameterLabel}>Yield (g)</Text>
							<Text style={styles.parameterValue}>
								{coffeeData.brewingParams.beverageWeight}
							</Text>
						</View>
						<View style={[styles.parameterCell, styles.fullWidthCell]}>
							<Text style={styles.parameterLabel}>Temperature (°C)</Text>
							<Text style={styles.parameterValue}>
								{coffeeData.brewingParams.temperature}
							</Text>
						</View>
					</View>
				</View>

				{/* Equipment Card */}
				<View style={styles.card}>
					<View style={[styles.cardHeader, { backgroundColor: '#8B5CF6' }]}>
						<Text style={styles.cardTitle}>Equipment</Text>
					</View>
					<View style={styles.cardContent}>
						{renderDataRow('Brewer', coffeeData.equipment.brewer)}
						{renderDataRow('Filter Paper', coffeeData.equipment.filterPaper)}
						{renderDataRow('Grinder', coffeeData.equipment.grinder)}
						{renderDataRow('Grind Setting', coffeeData.equipment.grindSetting)}
					</View>
				</View>

				{/* Technical Details Card */}
				<View style={[styles.card, styles.lastCard]}>
					<View style={[styles.cardHeader, { backgroundColor: '#F59E0B' }]}>
						<Text style={styles.cardTitle}>Technical Details</Text>
					</View>
					<View style={styles.cardContent}>
						{renderDataRow('TDS', coffeeData.technicalDetails.tds)}
					</View>
				</View>
			</ScrollView>

			{/* Floating Action Button */}
			<TouchableOpacity style={styles.fab}>
				<Plus fill={'#FFFFFF'} />
			</TouchableOpacity>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#121212',
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: '#2A2A2A',
	},
	backButton: {
		padding: 8,
	},
	headerTitle: {
		flex: 1,
		textAlign: 'center',
		fontSize: 18,
		fontWeight: '600',
		color: '#FFFFFF',
	},
	headerRightPlaceholder: {
		width: 40,
	},
	content: {
		flex: 1,
		padding: 16,
	},
	card: {
		backgroundColor: '#1E1E1E',
		borderRadius: 12,
		marginBottom: 16,
		overflow: 'hidden',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 2,
	},
	lastCard: {
		marginBottom: 80, // Extra space for FAB
	},
	cardHeader: {
		padding: 12,
	},
	cardTitle: {
		fontSize: 16,
		fontWeight: 'bold',
		color: '#FFFFFF',
	},
	cardContent: {
		padding: 8,
	},
	dataRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderBottomWidth: 1,
		borderBottomColor: '#2A2A2A',
	},
	dataLabel: {
		fontSize: 14,
		color: '#A0A0A0',
	},
	dataValue: {
		fontSize: 14,
		fontWeight: '500',
		color: '#FFFFFF',
	},
	parameterGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
	},
	parameterCell: {
		width: '50%',
		padding: 16,
		alignItems: 'center',
		justifyContent: 'center',
		borderRightWidth: 1,
		borderBottomWidth: 1,
		borderColor: '#2A2A2A',
	},
	fullWidthCell: {
		width: '100%',
		borderRightWidth: 0,
	},
	parameterLabel: {
		fontSize: 12,
		color: '#A0A0A0',
		marginBottom: 4,
	},
	parameterValue: {
		fontSize: 22,
		fontWeight: 'bold',
		color: '#FFFFFF',
	},
	fab: {
		position: 'absolute',
		right: 20,
		bottom: 20,
		width: 56,
		height: 56,
		borderRadius: 28,
		backgroundColor: '#3B82F6',
		justifyContent: 'center',
		alignItems: 'center',
		elevation: 6,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 4,
	},
});

export default NewLayout;
