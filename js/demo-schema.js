/*global require: false, module: false */
/*eslint new-cap: [0] */
'use strict';
var S = require('./schema');
var {d, string, array, number, or, nullval, boolean, object, dict, r} = S;

var dsID = d('dsID', 'JSON encoded host and dataset id',
			string(/{"host":".*","name":".*"}/));

var ColumnID = d(
	'ColumnID', 'UUID for identifying columns',
	string(/[0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{12}/)
);

var Column = d(
	'Column', 'A column for display', S({
	dsID: dsID,
	width: number([0]),
	dataType: or(
		'mutationVector',
		'geneMatrix',
		'probeMatrix',
		'geneProbeMatrix',
		'clinicalMatrix'
	),
	fields: [string()],
	fieldLabel: {
		user: string(),
		default: string()
	},
	columnLabel: {
		user: string(),
		default: string()
	}}));


var Columns = d(
	'Columns', 'A set of columns', dict({
		[ColumnID]: Column
	}));

var DataSubType = or(
	'copy number (gene-level)',
	'somatic non-silent mutation (gene-level)',
	'gene expression',
	'phenotype',
	'somatic mutation (SNPs and small INDELs)',
	'miRNA expression RNAseq',
	'DNA methylation',
	'somatic mutation',
	'miRNA expression',
	'exon expression RNAseq',
	'copy number',
	'gene expression RNAseq',
	'PARADIGM pathway activity',
	'protein expression RPPA',
	'gene expression array',
	'somatic mutation (SNP and small INDELs)',
	'gene expression Array');

// XXX There is also datasubtype. WTF is that?
var Dataset = d(
	'Dataset', 'Dataset metadata',
	S({
		articletitle: string(),
		author: string(),
		citation: string(),
		cohort: string(),
		dataSubType: DataSubType,
		dataproducer: string(),
		datasubtype: 'not sure why this is here',
		description: string(),
		dsID: dsID,
		label: string(),
		name: string(),
		probemap: or(string(), nullval),
		status: or('loading', 'loaded', 'error'),
		type: or('genomicMatrix',
				'genomicSegment',
				'probeMap',
				'clinicalMatrix',
				'genePredExt',
				'mutationVector'),
		url: string()
	})
);

var FeatureName = d(
	'FeatureName', 'Name of a feature. Should be unique in the dataset.',
	string()
);

var Feature = d(
	'Feature', 'Phenotype metdata',
	S(
		FeatureName, {
			// XXX why field_id?
			field_id: number(), // eslint-disable-line camelcase
			id: number(), // XXX why?
			longtitle: string(),
			name: string(),
			priority: number([0]),
			shorttitle: string(),
			valuetype: or('category', 'float'),
			visibility: or('off', 'on', nullval)
		}
	)
);

var FeatureID = d(
	'FeatureID', 'Primary key for a feature',
	S({
		dsID: dsID,
		name: FeatureName
	}));

var SampleID = d(
	'SampleID', 'A sample id. Must be unique within a cohort',
	string()
);

var ColorSpec = d(
	'ColorSpec', 'A color scale variant.',
	or(
		// XXX the r syntax is more verbose than I like
		['float-pos', r('low', number()), r('high', number()), r('min', number()), r('max', number())],
		array('float-neg', r('low', number()), r('high', number()), r('min', number()), r('max', number())),
		array('float', number(), number(), number(), number(), number()),
		array('float-thresh-pos', number(), number(), number(), number(), number()),
		array('float-thresh-neg', number(), number(), number(), number(), number()),
		array('float-thresh', number(), number(), number(), number(), number(), number(), number()),
		array('ordinal', number([0]))
	)
);

var HeatmapData = d(
	'HeatmapData', 'Matrix of values for heatmap display, ordered by field and sample.',
	array.of(r('field', array.of(r('sample', number()))))
);

var Gene = d('Gene', 'A gene name', string());
var Probe = d('Probe', 'A probe name', string());
var GeneOrProbe = d('GeneOrProbe', 'A gene or probe name', or(Gene, Probe));

var ProbeData = d(
	'ProbeData', 'Data for a probe column',
	S({
		metadata: Dataset, // XXX why is this here?
		req: {
			mean: {
				[GeneOrProbe]: number()
			},
			probes: array.of(string()),
			values: {
				[GeneOrProbe]: {
					[SampleID]: number() // or null? or NaN?
				}
			},
			display: HeatmapData
		}
	}));

var MutationData = d(
	'MutationData', 'Data for a mutation column',
	S({
	})
);
var VizSettings = d(
	'VizSettings', 'User settings for visualization',
	// object() same as S()
	object({
		max: number(),
		maxStart: or(number(), nullval),
		minStart: or(number(), nullval),
		min: number(),
		colNormalization: or(boolean, nullval)
	})
);

var Application = d(
	'Application', 'The application state',
	S({
		cohort: string(),
		cohorts: array.of(string()),
		columnOrder: array.of(ColumnID),
		columns: Columns,
		data: object.of(
			ColumnID, or(ProbeData, MutationData)
		),
		datasets: {
			datasets: object(
				dsID, Dataset
			),
			servers: array.of({
				server: string(),
				datasets: array.of(Dataset)
			})
		},
		features: {
			[dsID]: Feature
		},
		km: {
			vars: {
				event: FeatureID,
				patient: FeatureID,
				tte: FeatureID
			}
		},
		samples: array.of(string()),
		samplesFrom: or(string(), nullval),
		servers: {
			default: array.of(string()),
			user: array.of(string())
		},
		zoom: {
			count: number([0]),
			height: number([0]),
			index: number([0])
		},
		vizSettings: VizSettings
	})
);

var Chrom = d('Chrom', 'chrom', string(/chr[0-9]+/));


module.exports = {
	dsID: dsID,
	Column: Column,
	Gene: Gene,
	Probe: Probe,
	GeneOrProbe: GeneOrProbe,
	Chrom: Chrom,
	Dataset: Dataset,
	Feature: Feature,
	FeatureID: FeatureID,
	FeatureName: FeatureName,
	SampleID: SampleID,
	ColumnID: ColumnID,
	HeatmapData: HeatmapData,
	ColorSpec: ColorSpec,
	ProbeData: ProbeData,
	MutationData: MutationData,
	VizSettings: VizSettings,
	Application: Application,
	Foo: d('foo', 'foo', object({
		'/foo/': array.of(number())
	})),
	Bar: d('bar', 'bar', S([number([5])]))
};
