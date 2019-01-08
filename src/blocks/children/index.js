/**
 * External dependencies
 */
import { isUndefined, pickBy } from 'lodash';

/**
 * WordPress dependencies
 */
import { registerBlockType } from '@wordpress/blocks';
import getEditComponent from './getEditComponent';
import { select, withSelect } from '@wordpress/data';
import { Path, SVG } from '@wordpress/components';

const name = 'advanced-posts-blocks/children';
const edit = getEditComponent( name );

registerBlockType(
	name,
	{
		title: 'Children (Advanced Posts Blocks)',

		icon: (
			//feathericon#site-map
			<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
				<Path d="M19,15 C20.1045695,15 21,15.8954305 21,17 L21,19 C21,20.1045695 20.1045695,21 19,21 L17,21 C15.8954305,21 15,20.1045695 15,19 L15,17 C15,15.8954305 15.8954305,15 17,15 L17,13 L7,13 L7,15 C8.1045695,15 9,15.8954305 9,17 L9,19 C9,20.1045695 8.1045695,21 7,21 L5,21 C3.8954305,21 3,20.1045695 3,19 L3,17 C3,15.8954305 3.8954305,15 5,15 L5,13 C5,11.8954305 5.8954305,11 7,11 L11,11 L11,9 C9.8954305,9 9,8.1045695 9,7 L9,5 C9,3.8954305 9.8954305,3 11,3 L13,3 C14.1045695,3 15,3.8954305 15,5 L15,7 C15,8.1045695 14.1045695,9 13,9 L13,11 L17,11 C18.1045695,11 19,11.8954305 19,13 L19,15 Z M5,17 L5,19 L7,19 L7,17 L5,17 Z M17,17 L17,19 L19,19 L19,17 L17,17 Z M11,5 L11,7 L13,7 L13,5 L11,5 Z" />
			</SVG>
		),

		category: 'widgets',

		supports: {
			align: [ 'wide', 'full' ],
			html: false,
		},

		edit: withSelect( ( _, props ) => {
			const { attributes } = props;
			const { postsToShow, order, orderBy, postType: postTypeName } = attributes;
			const { postId } = attributes;
			const { getEntityRecords, getPostType, getPostTypes } = select( 'core' );
			const { getCurrentPostId, getCurrentPostType } = select( 'core/editor' );
			const postTypes = getPostTypes() || [];
			let selectedPostType;

			if ( postTypeName ) {
				selectedPostType = getPostType( postTypeName ) || {};
			} else {
				selectedPostType = getPostType( getCurrentPostType() ) || {};
			}

			const PostsQuery = pickBy( {
				orderby: orderBy,
				per_page: -1,
			}, ( value ) => ! isUndefined( value ) );

			const childrenPostsQuery = pickBy( {
				order,
				parent: postId ? postId : getCurrentPostId(),
				orderby: orderBy,
				per_page: postsToShow,
			}, ( value ) => ! isUndefined( value ) );

			return {
				postId,
				posts: getEntityRecords( 'postType', selectedPostType.slug, PostsQuery ) || [],
				children: getEntityRecords( 'postType', selectedPostType.slug, childrenPostsQuery ) || [],
				selectedPostType,
				postTypes: postTypes
					.filter( postType => postType.hierarchical )
					.filter( postType => postType.viewable )
					.filter( postType => postType.rest_base !== 'media' ),
			};
		} )( edit ),

		save() {
			return null;
		},
	}
);