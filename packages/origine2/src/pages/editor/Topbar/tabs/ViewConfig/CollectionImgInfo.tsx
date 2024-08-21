import { FC, Dispatch, SetStateAction } from 'react';
import {
	Button,
	Input,
	Dialog,
	DialogTrigger,
	DialogSurface,
	DialogTitle,
	DialogContent,
	DialogBody,
	DialogActions,
	Checkbox,
	Textarea,
} from '@fluentui/react-components';
import {
	ButtonItem,
	ButtonKey,
	ContainerItem,
	Scene,
	SceneUIConfig,
	SliderContainerItem,
	Style,
	UIItemConfig,
	CollectionItemKey,
} from '@/pages/editor/types';
import ChooseFile from '@/pages/editor/ChooseFile/ChooseFile';
import { IStyleConfig, InfoConfig, ICollectionImages, defaultCollectionImages } from './confg';
import { IStyleType } from './ViewTab'

import s from './viewTab.module.scss';

interface IProps {
	styleConfigArr: { label: string; style: IStyleConfig; key: string; info?: InfoConfig, images?: ICollectionImages }[];
	config: (UIItemConfig & { children: Record<string, UIItemConfig> }) | undefined;
	item: CollectionItemKey;
	type: 'buttons' | 'other';
	currentEditScene: Scene;
	itemIndex: number;
	setOptions: Dispatch<SetStateAction<SceneUIConfig>>;
	setContent: (value: string) => void;
	setStyle: (
		styleKey: keyof IStyleConfig,
		value: number | string | undefined,
		// styleType?: string
		styleType?: 'style' | 'hoverStyle',
	) => void;
	setHide: (value: boolean) => void;
	setInfo: (infoKey: keyof InfoConfig, value: number | string | undefined) => void;
	setImage: (imageKey: keyof ICollectionImages, value: string) => void;
}

export const CollectionInfo: FC<IProps> = (props: IProps) => {
	const {
		styleConfigArr,
		config,
		item, 
		type, 
		itemIndex, 
		setOptions, 
		setContent, 
		setStyle, 
		setHide, 
		setInfo, 
		setImage 
	} = props;

	return (
		<div key={itemIndex} className={s.flex}>
			<div className={s.row}>
				<span className={s.label}>{config?.label}</span>
			</div>
			<Checkbox
				checked={item?.args?.hide}
				onChange={(_, data) => {
					setHide(data.checked as boolean);
				}}
			/>
			<span>隐藏</span>
			{styleConfigArr.map(({ label, style, key, info, images }, index: number) => (
				<Dialog key={key + index}>
					<DialogTrigger disableButtonEnhancement>
						<Button style={{ margin: '5px' }} size="small">设置{label}</Button>
					</DialogTrigger>
					<DialogSurface style={{ maxWidth: '960px' }}>
						<DialogBody>
							<DialogTitle>{label}</DialogTitle>
							<DialogContent className={s.dialogContent}>
								{style.fontSize && key === 'style' && (
									<div className={s.row}>
										<span className={s.optionLabel}>文字</span>
										<Input value={item.content} onChange={(e) => setContent(e.target.value)} />
									</div>
								)}

								{images &&
									Object.entries(images).map(([imgKey, imgProp], idx: number) => {
										return (
											<div className={s.row} key={imgKey + index + idx}>
												<span className={s.optionLabel}>{imgProp.label}</span>
												<ChooseFile
													extName={['.png', '.jpg', '.jpeg', '.gif']}
													sourceBase={'ui'}
													onChange={(file) => {
														//@ts-ignore
														setImage(imgKey as keyof ICollectionImages, file?.name ?? '',)
													}}
												/>
												<span>
													{item?.args?.images?.[imgKey as keyof ICollectionImages] as any ?? ''}
												</span>
											</div>
										)
									})
								}

								{info &&
									Object.entries(info).map(([infoKey, infoProp], idx: number) => {
										return (
											<div className={s.row} key={infoKey + index + idx}>
												<span className={s.optionLabel}>{infoProp.label}</span>
												{infoKey === 'description' ? (
													<Textarea
														//@ts-ignore
														value={(item.args?.info?.[infoKey as keyof InfoConfig] as string) ?? ''}
														onChange={(e) => {
															const val = e.target.value as string;
															setInfo(infoKey as keyof InfoConfig, val);
														}}
													/>
												) : infoKey === 'image' ? (
													<div>
														<ChooseFile
															extName={['.png', '.jpg', '.jpeg', '.gif']}
															sourceBase={'ui'}
															onChange={(file) => {
																setInfo(infoKey as keyof InfoConfig, file?.name ?? '',);
															}}
														/>
														<span style={{ marginLeft: 12 }}>
															{item?.args?.info?.[infoKey as keyof InfoConfig] as any ?? ''}
														</span>
													</div>
												) : (
													<Input
														//@ts-ignore
														value={(item.args?.info?.[infoKey as keyof InfoConfig] as string) ?? ''}
														onChange={(e) => {
															const val = e.target.value as string;
															setInfo(infoKey as keyof InfoConfig, val);
														}}
													/>
												)}
											</div>
										);
									})}

								{Object.entries(style).map(([styleKey, styleProp], idx: number) => (
									<div className={s.row} key={styleKey + index + idx}>
										<span className={s.optionLabel}>{styleProp.label}</span>
										{styleProp.type === 'number' ? (
											<Input
												type="number"
												value={
													key === 'hoverStyle'
														? ((item as ButtonItem).args?.hoverStyle?.[styleKey as keyof IStyleConfig] as string) ?? ''
														: (item.args.style?.[styleKey as keyof IStyleConfig] as string) ?? ''
												}
												onChange={(e) => {
													setStyle(
														styleKey as keyof IStyleConfig,
														e.target.value === '' ? '' : Number(e.target.value),
														'style',
													);
												}}
											/>
										) : styleProp.type === 'color' ? (
											<input
												type="color"
												value={
													key === 'hoverStyle'
														? ((item as ButtonItem).args?.hoverStyle?.[styleKey as keyof IStyleConfig] as string) ?? ''
														: (item.args.style?.[styleKey as keyof IStyleConfig] as string) ?? ''
												}
												onChange={(e) => {
													setStyle(styleKey as keyof IStyleConfig, e.target.value, 'style');
												}}
											/>
										) : styleProp.type === 'image' ? (
											<div>
												<ChooseFile
													extName={['.png', '.jpg', '.jpeg', '.gif']}
													sourceBase={config?.type === 'bg' ? 'background' : 'ui'}
													onChange={(file) => {
														config?.type === 'bg' && key === 'style'
															? setContent(file?.name ?? '')
															: setStyle(styleKey as keyof IStyleConfig, file?.name ?? '', 'style')
													}}
												/>
												<span style={{ marginLeft: 12 }}>
													{config?.type === 'bg' && key === 'style'
														? item.content
														: key === 'hoverStyle'
															? ((item as ButtonItem).args?.hoverStyle?.[styleKey as keyof IStyleConfig] as string) ?? ''
															: item.args.style?.[styleKey as keyof IStyleConfig] ?? ''}
												</span>
											</div>
										) : null}
									</div>
								))}
							</DialogContent>
							<DialogActions>
								<DialogTrigger disableButtonEnhancement>
									<Button appearance="primary">确认</Button>
								</DialogTrigger>
							</DialogActions>
						</DialogBody>
					</DialogSurface>
				</Dialog>
			))}
		</div>
	);
};
