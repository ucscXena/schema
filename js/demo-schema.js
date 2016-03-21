/*global require: false, module: false */
/*eslint new-cap: [0] */
'use strict';
var S = require('./schema');
var {desc, fn, string, array, arrayOf, number, or, nullval, boolean, object, dict, role} = S;

var dsID = desc('dsID', 'JSON encoded host and dataset id',
			string(/{"host":".*","name":".*"}/));

var ColumnID = desc(
	'ColumnID', 'UUID for identifying columns',
	string(/[0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{12}/)
);

var Column = desc(
	'Column', 'A column for display', {
			dsID: dsID,
	width: number([0]),
	labelFormat: fn(string()).to(string()),
	fieldFormat: fn(string()),
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
	}});

var Columns = desc(
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
var Dataset = desc(
	'Dataset', 'Dataset metadata',
	{
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
	}
);

var FeatureName = desc(
	'FeatureName', 'Name of a feature. Should be unique in the dataset.',
	string()
);

var Feature = desc(
	'Feature', 'Phenotype metdata',
	{
		[FeatureName]: {
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
	}
);

var FeatureID = desc(
	'FeatureID', 'Primary key for a feature',
	{
		dsID: dsID,
		name: FeatureName
	});

var SampleID = desc(
	'SampleID', 'A sample id. Must be unique within a cohort',
	string()
);

var ColorSpec = desc(
	'ColorSpec', 'A color scale variant.',
	or(
		// XXX the role syntax is more verbose than I like
		['float-pos', ...['low', 'high', 'min', 'max'].map(r => role(r, number()))],
		['float-neg', ...['low', 'high', 'min', 'max'].map(r => role(r, number()))],
		array('float', number(), number(), number(), number(), number()),
		array('float-thresh-pos', number(), number(), number(), number(), number()),
		array('float-thresh-neg', number(), number(), number(), number(), number()),
		array('float-thresh', number(), number(), number(), number(), number(), number(), number()),
		array('ordinal', number([0]))
	)
);

var HeatmapData = desc(
	'HeatmapData', 'Matrix of values for heatmap display, ordered by field and sample.',
	arrayOf(role('field', arrayOf(role('sample', number()))))
);

var Gene = desc('Gene', 'A gene name', string());
var Probe = desc('Probe', 'A probe name', string());
var GeneOrProbe = desc('GeneOrProbe', 'A gene or probe name', or(Gene, Probe));

var ProbeData = desc(
	'ProbeData', 'Data for a probe column',
	{
		metadata: Dataset, // XXX why is this here?
		req: {
			mean: {
				[GeneOrProbe]: number()
			},
			probes: arrayOf(string()),
			values: {
				[GeneOrProbe]: {
					[SampleID]: number() // or null? or NaN?
				}
			},
			display: HeatmapData
		}
	});

var MutationData = desc(
	'MutationData', 'Data for a mutation column',
	{
	}
);
var VizSettings = desc(
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

var Application = desc(
	'Application', 'The application state',
	{
		cohort: string(),
		cohorts: arrayOf(string()),
		columnOrder: arrayOf(ColumnID),
		columns: Columns,
		data: dict(
			ColumnID, or(ProbeData, MutationData)
		),
		datasets: {
			datasets: object(
				dsID, Dataset
			),
			servers: arrayOf({
				server: string(),
				datasets: arrayOf(Dataset)
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
		samples: arrayOf(string()),
		samplesFrom: or(string(), nullval),
		servers: {
			default: arrayOf(string()),
			user: arrayOf(string())
		},
		zoom: {
			count: number([0]),
			height: number([0]),
			index: number([0])
		},
		vizSettings: VizSettings
	}
);

var Chrom = desc('Chrom', 'chrom', string(/chr[0-9]+/));


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
	Foo: desc('foo', 'foo', object({
		'/foo/': arrayOf(number())
	})),
	Bar: desc('bar', 'bar', S([number([5])]))
};
