import { useLayoutEffect, useState, useMemo, memo } from 'react';
import { Image, ImageProps, ImageURISource, Platform, PixelRatio } from 'react-native';

export interface AutoImageProps extends ImageProps {
    /**
     * Hình ảnh nên rộng bao nhiêu?
     */
    maxWidth?: number;
    /**
     * Hình ảnh nên cao bao nhiêu?
     */
    maxHeight?: number;
    headers?: {
        [key: string]: string
    }
}

export function useAutoImage(
    remoteUri: string,
    headers?: {
        [key: string]: string
    },
    dimensions?: [maxWidth?: number, maxHeight?: number],
): [width: number, height: number] {
    const [[remoteWidth, remoteHeight], setRemoteImageDimensions] = useState([0, 0]);
    const [maxWidth, maxHeight] = dimensions ?? [];

    useLayoutEffect(() => {
        if (!remoteUri) {
            return;
        }

        let cancelled = false;

        const loadImageSize = (w: number, h: number) => {
            if (!cancelled) {
                setRemoteImageDimensions([w, h]);
            }
        };

        if (!headers) {
            Image.getSize(remoteUri, loadImageSize);
        } else {
            Image.getSizeWithHeaders(remoteUri, headers, loadImageSize);
        }

        return () => {
            cancelled = true;
        };
    }, [remoteUri, headers]);

    return useMemo(() => {
        if (remoteWidth === 0 || remoteHeight === 0) {
            return [0, 0];
        }

        const remoteAspectRatio = remoteWidth / remoteHeight;

        if (Number.isNaN(remoteAspectRatio)) {
            return [0, 0];
        }

        if (maxWidth && maxHeight) {
            const aspectRatio = Math.min(maxWidth / remoteWidth, maxHeight / remoteHeight);
            return [
                PixelRatio.roundToNearestPixel(remoteWidth * aspectRatio),
                PixelRatio.roundToNearestPixel(remoteHeight * aspectRatio),
            ];
        } else if (maxWidth) {
            return [maxWidth, PixelRatio.roundToNearestPixel(maxWidth / remoteAspectRatio)];
        } else if (maxHeight) {
            return [PixelRatio.roundToNearestPixel(maxHeight * remoteAspectRatio), maxHeight];
        } else {
            return [remoteWidth, remoteHeight];
        }
    }, [remoteWidth, remoteHeight, maxWidth, maxHeight]);
}

export const AutoImage = memo(function AutoImage(props: AutoImageProps) {
    const { maxWidth, maxHeight, ...restImageProps } = props;
    const source = props.source as ImageURISource;
    const headers = source?.headers;

    const remoteUri = useMemo(() => {
        return Platform.select({
            web: (source?.uri as string) ?? (source as string),
            default: source?.uri as string,
        });
    }, [source]);

    const dimensions = useMemo(() => [maxWidth, maxHeight] as [maxWidth?: number, maxHeight?: number], [maxWidth, maxHeight]);

    const [width, height] = useAutoImage(remoteUri, headers, dimensions);

    const imageStyle = useMemo(() => [{ width, height }, props.style], [width, height, props.style]);

    return <Image {...restImageProps} style={imageStyle} />;
});
